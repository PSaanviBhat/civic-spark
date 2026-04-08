from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.issue import Issue, IssueStatus, IssueCategory
from app.models.gamification import IssueVote, IssueMedia, IssueFollower
from app.models.user import User
from datetime import datetime
from typing import List, Optional


def create_issue(
    db: Session,
    title: str,
    description: str,
    category: str,
    latitude: float,
    longitude: float,
    address: str,
    reporter_id: int,
    media_keys: Optional[List[str]] = None,
) -> Issue:
    """Create a new issue"""
    issue = Issue(
        title=title,
        description=description,
        category=IssueCategory(category),
        status=IssueStatus.CRITICAL,
        latitude=latitude,
        longitude=longitude,
        address=address,
        reporter_id=reporter_id,
    )
    db.add(issue)
    db.flush()

    # Add media if provided
    if media_keys:
        for key in media_keys:
            media = IssueMedia(issue_id=issue.id, s3_key=key, mime_type="image/jpeg")
            db.add(media)

    db.commit()
    db.refresh(issue)
    return issue


def get_issues(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user_id: Optional[int] = None,
) -> tuple[List[Issue], int]:
    """Get paginated list of issues with optional filters"""
    query = db.query(Issue)

    if category:
        query = query.filter(Issue.category == category)

    if status:
        query = query.filter(Issue.status == status)

    # Order by creation date (newest first)
    query = query.order_by(Issue.created_at.desc())

    total = query.count()
    issues = query.offset(skip).limit(limit).all()

    return issues, total


def get_issue_by_id(db: Session, issue_id: int) -> Issue | None:
    """Get issue by ID"""
    return db.query(Issue).filter(Issue.id == issue_id).first()


def get_issues_by_bbox(
    db: Session,
    min_lat: float,
    max_lat: float,
    min_lng: float,
    max_lng: float,
    category: Optional[str] = None,
) -> List[Issue]:
    """Get issues within bounding box (for map)"""
    query = db.query(Issue).filter(
        and_(
            Issue.latitude >= min_lat,
            Issue.latitude <= max_lat,
            Issue.longitude >= min_lng,
            Issue.longitude <= max_lng,
        )
    )

    if category:
        query = query.filter(Issue.category == category)

    return query.all()


def upvote_issue(db: Session, issue_id: int, user_id: int) -> bool:
    """Add or remove upvote from issue"""
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        return False

    # Check if user already voted
    existing_vote = db.query(IssueVote).filter(
        and_(IssueVote.issue_id == issue_id, IssueVote.user_id == user_id)
    ).first()

    if existing_vote:
        # Remove vote
        db.delete(existing_vote)
        issue.upvotes = max(0, issue.upvotes - 1)
    else:
        # Add vote
        vote = IssueVote(issue_id=issue_id, user_id=user_id, weight=1.0)
        db.add(vote)
        issue.upvotes += 1

    db.commit()
    db.refresh(issue)
    return True


def get_user_upvote(db: Session, issue_id: int, user_id: int) -> bool:
    """Check if user has upvoted issue"""
    return (
        db.query(IssueVote)
        .filter(and_(IssueVote.issue_id == issue_id, IssueVote.user_id == user_id))
        .first()
        is not None
    )


def get_user_track(db: Session, issue_id: int, user_id: int) -> bool:
    return (
        db.query(IssueFollower)
        .filter(and_(IssueFollower.issue_id == issue_id, IssueFollower.user_id == user_id))
        .first()
        is not None
    )


def toggle_issue_tracking(db: Session, issue_id: int, user_id: int) -> bool:
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        return False

    existing_track = (
        db.query(IssueFollower)
        .filter(and_(IssueFollower.issue_id == issue_id, IssueFollower.user_id == user_id))
        .first()
    )

    if existing_track:
        db.delete(existing_track)
    else:
        db.add(IssueFollower(issue_id=issue_id, user_id=user_id))

    db.commit()
    return True


def update_issue_status(db: Session, issue_id: int, new_status: str) -> Issue | None:
    """Update issue status"""
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        return None

    issue.status = IssueStatus(new_status)
    if new_status == "resolved":
        issue.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(issue)
    return issue
