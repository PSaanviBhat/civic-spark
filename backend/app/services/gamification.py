from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.user import User
from app.models.issue import Issue, IssueStatus
from typing import List


LEVEL_THRESHOLDS = {
    1: (0, 100),       # Citizen
    2: (100, 300),     # Active Reporter
    3: (300, 700),     # City Helper
    4: (700, 1500),    # Community Leader
    5: (1500, float('inf')),  # City Champion
}

LEVEL_NAMES = {
    1: "Citizen",
    2: "Active Reporter",
    3: "City Helper",
    4: "Community Leader",
    5: "City Champion",
}

POINTS_CONFIG = {
    "report_issue": 20,
    "upvote_received": 2,
    "add_evidence": 10,
    "verify_resolution": 15,
    "daily_login": 5,
}


def award_xp(db: Session, user_id: int, points: int) -> None:
    """Award XP to user and update level"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    user.xp += points

    # Update level
    for level, (min_xp, max_xp) in LEVEL_THRESHOLDS.items():
        if min_xp <= user.xp < max_xp:
            user.level = level
            break

    db.commit()


def get_leaderboard(db: Session, limit: int = 20, skip: int = 0) -> List[dict]:
    """Get leaderboard ranked by XP"""
    users = (
        db.query(User)
        .filter(User.xp > 0)
        .order_by(desc(User.xp))
        .offset(skip)
        .limit(limit)
        .all()
    )

    leaderboard = []
    for rank, user in enumerate(users, start=skip + 1):
        leaderboard.append(
            {
                "rank": rank,
                "user_id": user.id,
                "name": user.name,
                "level": user.level,
                "xp": user.xp,
                "levelName": LEVEL_NAMES.get(user.level, "Unknown"),
                "points": user.xp,
                "change": 0,  # Simplified for MVP
            }
        )

    return leaderboard


def get_user_rank(db: Session, user_id: int) -> int:
    """Get user's current rank"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return -1

    rank = (
        db.query(User)
        .filter(User.xp > user.xp)
        .count()
    ) + 1

    return rank


def get_user_stats(db: Session, user_id: int) -> dict:
    """Get user's gamification stats"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    # Get next level threshold
    next_level = user.level + 1
    next_level_xp = LEVEL_THRESHOLDS.get(next_level, (float('inf'), float('inf')))[0]

    # Count issues reported and resolved
    issues_reported = db.query(Issue).filter(Issue.reporter_id == user_id).count()
    issues_resolved = db.query(Issue).filter(
        Issue.reporter_id == user_id,
        Issue.status == IssueStatus.RESOLVED
    ).count()

    return {
        "xp": user.xp,
        "level": user.level,
        "levelName": LEVEL_NAMES.get(user.level, "Unknown"),
        "next_level_xp": next_level_xp,
        "streak_days": user.streak_days,
        "issues_reported": issues_reported,
        "issues_resolved": issues_resolved,
    }
