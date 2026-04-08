from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:8080"
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    DATABASE_URL: str = "postgresql://civic_user:civic_password@localhost:5432/civic_spark"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET_NAME: str = "civic-spark-uploads"
    AWS_REGION: str = "us-east-1"
    AWS_S3_PUBLIC_BASE_URL: str = ""
    AWS_REKOGNITION_MIN_CONFIDENCE: float = 70.0

@lru_cache()
def get_settings():
    return Settings()
