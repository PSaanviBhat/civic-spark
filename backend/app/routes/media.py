from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.utils.s3 import generate_presigned_url
import uuid

router = APIRouter(prefix="/v1/media", tags=["media"])


class PresignUploadRequest(BaseModel):
    filename: str
    mime_type: str


class PresignUploadResponse(BaseModel):
    upload_url: str
    file_key: str


@router.post("/presign-upload", response_model=PresignUploadResponse)
def presign_upload(
    request: PresignUploadRequest,
    current_user = Depends(get_current_user),
):
    """Generate presigned URL for direct S3 upload"""
    # Generate unique file key
    file_extension = request.filename.split(".")[-1]
    file_key = f"issues/{current_user.id}/{uuid.uuid4()}.{file_extension}"

    # Generate presigned URL
    upload_url = generate_presigned_url(file_key)
    if not upload_url:
        raise HTTPException(status_code=500, detail="Failed to generate upload URL")

    return PresignUploadResponse(upload_url=upload_url, file_key=file_key)
