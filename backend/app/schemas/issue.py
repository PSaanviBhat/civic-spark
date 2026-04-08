from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LocationSchema(BaseModel):
    lat: float
    lng: float
    address: str


class MediaResponse(BaseModel):
    id: int
    s3_key: str
    mime_type: str

    class Config:
        from_attributes = True


class IssueCreate(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    address: str
    media_keys: Optional[List[str]] = None


class IssueUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None


class IssueResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    location: LocationSchema
    reportedBy: str
    upvotes: int
    reportedAt: str
    imageUrl: Optional[str] = None
    hasUpvoted: bool = False
    isVerified: bool = False
    verificationStatus: str = "pending"
    aiConfidence: float = 0.0
    isTracked: bool = False

    class Config:
        from_attributes = True


class IssueListResponse(BaseModel):
    issues: List[IssueResponse]
    total: int
    page: int
    page_size: int
