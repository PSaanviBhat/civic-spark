from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.gamification import AIVerificationJob
from app.models.issue import Issue

settings = get_settings()

rekognition_client = boto3.client(
    "rekognition",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


CATEGORY_LABEL_HINTS = {
    "pothole": {"Road", "Street", "Asphalt", "Surface"},
    "streetlight": {"Road", "Street", "Lamp", "Lighting", "Pole"},
    "garbage": {"Trash", "Garbage", "Waste", "Junk", "Litter"},
    "water": {"Water", "Flood", "Puddle", "Pipe"},
    "traffic": {"Road", "Street", "Traffic Light", "Vehicle", "Transportation"},
    "other": {"Road", "Street", "Urban", "City"},
}


def _upsert_verification_job(db: Session, issue_id: int, status: str, confidence: float, result: str):
    job = db.query(AIVerificationJob).filter(AIVerificationJob.issue_id == issue_id).first()
    if not job:
        job = AIVerificationJob(issue_id=issue_id)
        db.add(job)

    job.status = status
    job.confidence_score = confidence
    job.verification_result = result
    job.completed_at = datetime.utcnow() if status == "completed" else None
    return job


def verify_issue_image(db: Session, issue_id: int, file_key: Optional[str]) -> dict:
    """Verify an uploaded civic issue image with AWS Rekognition."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue or not file_key:
        return {"error": "Issue or file not found"}

    try:
        image_payload = {"S3Object": {"Bucket": settings.AWS_S3_BUCKET_NAME, "Name": file_key}}

        moderation = rekognition_client.detect_moderation_labels(
            Image=image_payload,
            MinConfidence=settings.AWS_REKOGNITION_MIN_CONFIDENCE,
        )
        unsafe = len(moderation.get("ModerationLabels", [])) > 0

        labels_response = rekognition_client.detect_labels(
            Image=image_payload,
            MaxLabels=20,
            MinConfidence=settings.AWS_REKOGNITION_MIN_CONFIDENCE,
        )

        labels = labels_response.get("Labels", [])
        label_names = {label["Name"] for label in labels}
        expected_labels = CATEGORY_LABEL_HINTS.get(issue.category.value, CATEGORY_LABEL_HINTS["other"])
        matched_labels = expected_labels.intersection(label_names)
        best_confidence = max((label["Confidence"] for label in labels), default=0.0)

        is_verified = (not unsafe) and (len(matched_labels) > 0 or issue.category.value == "other")
        result = "verified" if is_verified else "needs-review"

        issue.is_verified = is_verified
        issue.verification_status = "completed"
        issue.ai_confidence = best_confidence / 100

        _upsert_verification_job(
            db=db,
            issue_id=issue_id,
            status="completed",
            confidence=best_confidence / 100,
            result=result,
        )
        db.commit()

        return {
            "issue_id": issue_id,
            "result": result,
            "confidence": round(best_confidence / 100, 4),
            "matched_labels": sorted(matched_labels),
            "unsafe_content": unsafe,
        }
    except (ClientError, BotoCoreError) as exc:
        issue.is_verified = False
        issue.verification_status = "failed"
        issue.ai_confidence = 0.0
        _upsert_verification_job(
            db=db,
            issue_id=issue_id,
            status="failed",
            confidence=0.0,
            result=str(exc),
        )
        db.commit()
        return {"error": str(exc)}


def detect_duplicate_issues(db: Session, issue_id: int) -> list[dict]:
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        return []

    candidates = db.query(Issue).filter(
        Issue.id != issue_id,
        Issue.category == issue.category,
        Issue.created_at >= datetime.utcnow() - timedelta(days=30),
    ).all()

    duplicates = []
    for candidate in candidates:
        distance = calculate_distance(
            issue.latitude,
            issue.longitude,
            candidate.latitude,
            candidate.longitude,
        )
        if distance < 0.1:
            duplicates.append(
                {
                    "duplicate_issue_id": candidate.id,
                    "title": candidate.title,
                    "distance_km": round(distance, 3),
                }
            )

    return duplicates


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c
