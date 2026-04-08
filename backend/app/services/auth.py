from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token
from app.services.gamification import award_xp, POINTS_CONFIG
from datetime import datetime, timedelta


def register_user(db: Session, email: str, password: str, name: str) -> User:
    """Register a new user"""
    user = User(
        phone_or_email=email,
        password_hash=hash_password(password),
        name=name,
        level=1,
        xp=0,
        trust_score=1.0,
        streak_days=1,
        last_activity_date=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate user and return user object"""
    user = db.query(User).filter(User.phone_or_email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None

    now = datetime.utcnow()
    last_activity = user.last_activity_date
    if last_activity is None or last_activity.date() != now.date():
        if last_activity and (now.date() - last_activity.date()).days == 1:
            user.streak_days += 1
        else:
            user.streak_days = 1

        user.last_activity_date = now
        db.commit()
        award_xp(db, user.id, POINTS_CONFIG["daily_login"])

    return user


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user_token(user: User) -> str:
    """Create JWT token for user"""
    access_token_expires = timedelta(minutes=60)
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
