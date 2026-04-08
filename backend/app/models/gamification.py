from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class IssueVote(Base):
    __tablename__ = "issue_votes"
    __table_args__ = (UniqueConstraint("issue_id", "user_id", name="unique_issue_user_vote"),)

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="votes")
    user = relationship("User", back_populates="votes")


class IssueMedia(Base):
    __tablename__ = "issue_media"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), index=True)
    s3_key = Column(String, unique=True)
    mime_type = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="media")


class IssueFollower(Base):
    __tablename__ = "issue_followers"
    __table_args__ = (UniqueConstraint("issue_id", "user_id", name="unique_issue_user_follow"),)

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="followers")
    user = relationship("User", back_populates="tracked_issues")


class IssueStatusChange(Base):
    __tablename__ = "issue_status_changes"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), index=True)
    from_status = Column(String)
    to_status = Column(String)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIVerificationJob(Base):
    __tablename__ = "ai_verification_jobs"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), unique=True, index=True)
    status = Column(String, default="pending")  # pending, completed, failed
    confidence_score = Column(Float, default=0.0)
    verification_result = Column(String)  # verified, suspicious, spam
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
