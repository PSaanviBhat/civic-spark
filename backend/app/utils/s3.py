import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from typing import Optional
from app.config import get_settings

settings = get_settings()

# S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
    endpoint_url=f"https://s3.{settings.AWS_REGION}.amazonaws.com" if settings.AWS_REGION else None,
    config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
)


def generate_presigned_url(file_key: str, expiration: int = 3600) -> Optional[str]:
    """Generate presigned upload URL for S3"""
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": settings.AWS_S3_BUCKET_NAME, "Key": file_key},
            ExpiresIn=expiration,
        )
        return url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None


def generate_presigned_get_url(file_key: str, expiration: int = 3600) -> Optional[str]:
    """Generate presigned download URL for S3"""
    try:
        return s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET_NAME, "Key": file_key},
            ExpiresIn=expiration,
        )
    except ClientError as e:
        print(f"Error generating presigned GET URL: {e}")
        return None


def get_file_url(file_key: Optional[str]) -> Optional[str]:
    """Return a public S3 URL when configured, otherwise a presigned GET URL."""
    if not file_key:
        return None

    public_base = settings.AWS_S3_PUBLIC_BASE_URL.strip()
    if public_base:
        return f"{public_base.rstrip('/')}/{file_key}"

    return generate_presigned_get_url(file_key)


def delete_s3_object(file_key: str) -> bool:
    """Delete object from S3"""
    try:
        s3_client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=file_key)
        return True
    except ClientError as e:
        print(f"Error deleting S3 object: {e}")
        return False
