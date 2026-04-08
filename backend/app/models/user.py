from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_or_email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    trust_score = Column(Float, default=1.0)
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    issues = relationship("Issue", back_populates="reporter")
    votes = relationship("IssueVote", back_populates="user")
    tracked_issues = relationship("IssueFollower", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "xp": self.xp,
            "trust_score": self.trust_score,
            "streak_days": self.streak_days,
        }
