from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    name: str
    phone_or_email: str
    password: str


class UserLogin(BaseModel):
    phone_or_email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    phone_or_email: str
    level: int
    xp: int
    trust_score: float
    streak_days: int

    class Config:
        from_attributes = True
