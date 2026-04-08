from pydantic import BaseModel


class UserProfile(BaseModel):
    id: int
    name: str
    level: int
    xp: int
    trust_score: float
    streak_days: int

    class Config:
        from_attributes = True
