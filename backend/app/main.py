from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.config import get_settings
from app.routes import auth, issues, media, gamification, health

settings = get_settings()


frontend_origin = settings.FRONTEND_URL.rstrip("/")

allowed_origins = [
    frontend_origin,
    "https://civic-spark-nine.vercel.app",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Civic Spark API",
    description="API for civic issue reporting system",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(allowed_origins)),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(media.router)
app.include_router(gamification.router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Civic Spark API",
        "status": "running",
        "environment": settings.ENVIRONMENT,
    }
