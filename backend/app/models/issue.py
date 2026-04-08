from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class IssueStatus(str, enum.Enum):
    CRITICAL = "critical"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"


class IssueCategory(str, enum.Enum):
    POTHOLE = "pothole"
    STREETLIGHT = "streetlight"
    GARBAGE = "garbage"
    WATER = "water"
    TRAFFIC = "traffic"
    OTHER = "other"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(SQLEnum(IssueCategory), index=True)
    status = Column(SQLEnum(IssueStatus), default=IssueStatus.CRITICAL, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    
    # AI verification
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    ai_confidence = Column(Float, default=0.0)
    
    # Engagement
    upvotes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    reporter = relationship("User", back_populates="issues")
    media = relationship("IssueMedia", back_populates="issue", cascade="all, delete-orphan")
    votes = relationship("IssueVote", back_populates="issue", cascade="all, delete-orphan")
    followers = relationship("IssueFollower", back_populates="issue", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category.value,
            "status": self.status.value,
            "location": {
                "lat": self.latitude,
                "lng": self.longitude,
                "address": self.address,
            },
            "reportedBy": self.reporter.name if self.reporter else "Anonymous",
            "upvotes": self.upvotes,
            "reportedAt": self.created_at.isoformat(),
            "imageUrl": self.media[0].s3_key if self.media else None,
        }
