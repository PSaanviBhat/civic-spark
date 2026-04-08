from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth import register_user, authenticate_user, get_user_by_id, create_user_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing = db.query(__import__('app.models.user', fromlist=['User']).User).filter(
        __import__('app.models.user', fromlist=['User']).User.phone_or_email == user_data.phone_or_email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    user = register_user(db, user_data.phone_or_email, user_data.password, user_data.name)
    token = create_user_token(user)

    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = authenticate_user(db, credentials.phone_or_email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_user_token(user)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        phone_or_email=current_user.phone_or_email,
        level=current_user.level,
        xp=current_user.xp,
        trust_score=current_user.trust_score,
        streak_days=current_user.streak_days,
    )
