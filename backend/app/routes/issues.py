from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.issue import IssueCreate, IssueResponse, IssueListResponse, IssueUpdate
from app.services.issues import (
    create_issue,
    get_issues,
    get_issue_by_id,
    get_issues_by_bbox,
    upvote_issue,
    get_user_upvote,
    get_user_track,
    toggle_issue_tracking,
    update_issue_status,
)
from app.services.gamification import award_xp, POINTS_CONFIG
from app.services.ai import verify_issue_image
from app.utils.s3 import get_file_url


def build_issue_response(db: Session, issue, current_user_id: int):
    return IssueResponse(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        category=issue.category.value,
        status=issue.status.value,
        location={
            "lat": issue.latitude,
            "lng": issue.longitude,
            "address": issue.address,
        },
        reportedBy=issue.reporter.name if issue.reporter else "Anonymous",
        upvotes=issue.upvotes,
        reportedAt=issue.created_at.isoformat(),
        imageUrl=get_file_url(issue.media[0].s3_key) if issue.media else None,
        hasUpvoted=get_user_upvote(db=db, issue_id=issue.id, user_id=current_user_id),
        isVerified=issue.is_verified,
        verificationStatus=issue.verification_status,
        aiConfidence=issue.ai_confidence,
        isTracked=get_user_track(db=db, issue_id=issue.id, user_id=current_user_id),
    )

router = APIRouter(prefix="/v1/issues", tags=["issues"])


@router.post("", response_model=IssueResponse, status_code=201)
def create_new_issue(
    issue_data: IssueCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new civic issue"""
    issue = create_issue(
        db,
        title=issue_data.title,
        description=issue_data.description,
        category=issue_data.category,
        latitude=issue_data.latitude,
        longitude=issue_data.longitude,
        address=issue_data.address,
        reporter_id=current_user.id,
        media_keys=issue_data.media_keys,
    )

    # Award XP for reporting
    award_xp(db, current_user.id, POINTS_CONFIG["report_issue"])
    if issue_data.media_keys:
        award_xp(db, current_user.id, POINTS_CONFIG["add_evidence"])
        verify_issue_image(db, issue.id, issue_data.media_keys[0])

    issue = get_issue_by_id(db, issue.id)
    return build_issue_response(db, issue, current_user.id)


@router.get("", response_model=IssueListResponse)
def list_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    status: str = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get paginated list of issues"""
    issues, total = get_issues(db, skip=skip, limit=limit, category=category, status=status)

    issue_list = [build_issue_response(db, issue, current_user.id) for issue in issues]

    return IssueListResponse(
        issues=issue_list,
        total=total,
        page=skip // limit + 1,
        page_size=limit,
    )


@router.get("/map", response_model=IssueListResponse)
def get_issues_on_map(
    min_lat: float = Query(...),
    max_lat: float = Query(...),
    min_lng: float = Query(...),
    max_lng: float = Query(...),
    category: str = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get issues within map bounding box"""
    issues = get_issues_by_bbox(db, min_lat, max_lat, min_lng, max_lng, category)

    issue_list = [build_issue_response(db, issue, current_user.id) for issue in issues]

    return IssueListResponse(
        issues=issue_list,
        total=len(issue_list),
        page=1,
        page_size=len(issue_list),
    )


@router.get("/{issue_id}", response_model=IssueResponse)
def get_single_issue(
    issue_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single issue by ID"""
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    return build_issue_response(db, issue, current_user.id)


@router.post("/{issue_id}/upvote", status_code=200)
def toggle_upvote(
    issue_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add/remove upvote from issue"""
    success = upvote_issue(db, issue_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue = get_issue_by_id(db, issue_id)
    has_upvoted = get_user_upvote(db, issue.id, current_user.id)

    return {
        "issue_id": issue_id,
        "upvotes": issue.upvotes,
        "hasUpvoted": has_upvoted,
    }


@router.post("/{issue_id}/track", status_code=200)
def toggle_track(
    issue_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add or remove issue tracking for the current user."""
    success = toggle_issue_tracking(db, issue_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Issue not found")

    return {
        "issue_id": issue_id,
        "isTracked": get_user_track(db, issue_id, current_user.id),
    }


@router.patch("/{issue_id}/status", response_model=IssueResponse)
def change_issue_status(
    issue_id: int,
    payload: IssueUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an issue status. Reporter can resolve their own issue."""
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if issue.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the reporter can change this issue status")

    if not payload.status:
        raise HTTPException(status_code=400, detail="Status is required")

    updated_issue = update_issue_status(db, issue_id, payload.status)
    if not updated_issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    return build_issue_response(db, updated_issue, current_user.id)
