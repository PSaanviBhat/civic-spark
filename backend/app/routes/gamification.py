from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.gamification import LeaderboardResponse, GamificationStatsResponse
from app.services.gamification import get_leaderboard, get_user_rank, get_user_stats

router = APIRouter(prefix="/v1/gamification", tags=["gamification"])


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard_endpoint(
    limit: int = Query(20, le=100),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get leaderboard"""
    entries = get_leaderboard(db, limit=limit, skip=skip)
    current_user_rank = get_user_rank(db, current_user.id)

    return LeaderboardResponse(
        entries=entries,
        current_user_rank=current_user_rank,
        period="weekly",
    )


@router.get("/me", response_model=GamificationStatsResponse)
def get_user_gamification_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's gamification stats"""
    stats = get_user_stats(db, current_user.id)

    return GamificationStatsResponse(
        xp=stats["xp"],
        level=stats["level"],
        next_level_xp=stats["next_level_xp"],
        streak_days=stats["streak_days"],
        badges_earned=0,  # Simplified for MVP
        issues_reported=stats["issues_reported"],
        issues_resolved=stats["issues_resolved"],
    )
