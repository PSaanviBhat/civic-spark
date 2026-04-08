from pydantic import BaseModel
from typing import List


class LeaderboardEntryResponse(BaseModel):
    rank: int
    user_id: int
    name: str
    level: int
    xp: int
    levelName: str
    points: int
    change: int = 0


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntryResponse]
    current_user_rank: int
    period: str = "weekly"


class GamificationStatsResponse(BaseModel):
    xp: int
    level: int
    next_level_xp: int
    streak_days: int
    badges_earned: int
    issues_reported: int
    issues_resolved: int
