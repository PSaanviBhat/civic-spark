# Comprehensive API Documentation

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your AWS S3 credentials
```

### Running Locally

With Docker Compose (recommended):
```bash
docker-compose up
```

Without Docker:
```bash
# Install PostgreSQL locally
# Create database: createdb civic_spark -U postgres
python main.py
```

API will be available at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

---

## API Routes

### Authentication

**POST /v1/auth/register**
```json
{
  "name": "John Doe",
  "phone_or_email": "john@example.com",
  "password": "securepass123"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**POST /v1/auth/login**
```json
{
  "phone_or_email": "john@example.com",
  "password": "securepass123"
}
```

**GET /v1/auth/me**
- Requires: `Authorization: Bearer {token}`

Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "level": 3,
  "xp": 485,
  "trust_score": 1.0,
  "streak_days": 12
}
```

---

### Issues

**POST /v1/issues**
- Requires: `Authorization: Bearer {token}`

```json
{
  "title": "Large pothole on MG Road",
  "description": "Dangerous pothole near Trinity Circle",
  "category": "pothole",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "MG Road, Near Trinity Circle, Bengaluru",
  "media_keys": ["issues/1/uuid.jpg"]
}
```

Response:
```json
{
  "id": 1,
  "title": "Large pothole on MG Road",
  "category": "pothole",
  "status": "critical",
  "upvotes": 0,
  "reportedAt": "2024-01-15T10:30:00",
  "imageUrl": "issues/1/uuid.jpg",
  "isVerified": false
}
```

**GET /v1/issues?skip=0&limit=20&category=pothole&status=critical**

**GET /v1/issues/map?min_lat=12.9&max_lat=13.0&min_lng=77.5&max_lng=77.7**

**GET /v1/issues/{issue_id}**

**POST /v1/issues/{issue_id}/upvote**

Response:
```json
{
  "issue_id": 1,
  "upvotes": 48,
  "hasUpvoted": true
}
```

---

### Media

**POST /v1/media/presign-upload**
- Requires: `Authorization: Bearer {token}`

```json
{
  "filename": "issue-photo.jpg",
  "mime_type": "image/jpeg"
}
```

Response:
```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "file_key": "issues/1/uuid.jpg"
}
```

Frontend flow:
1. Call presign-upload to get URL and file_key
2. Client uploads to S3 using presigned URL
3. Include file_key when creating issue

---

### Gamification

**GET /v1/gamification/me**
- Requires: `Authorization: Bearer {token}`

Response:
```json
{
  "xp": 485,
  "level": 3,
  "next_level_xp": 700,
  "streak_days": 12,
  "badges_earned": 3,
  "issues_reported": 24,
  "issues_resolved": 18
}
```

**GET /v1/gamification/leaderboard?limit=20&skip=0**

Response:
```json
{
  "entries": [
    {
      "rank": 1,
      "user_id": 10,
      "name": "Priya Sharma",
      "level": 5,
      "xp": 1820,
      "levelName": "City Champion",        "points": 1820,
      "change": 0
    }
  ],
  "current_user_rank": 7,
  "period": "weekly"
}
```

---

## Database Schema

### Key Tables

- `users` - User profiles, levels, XP
- `issues` - Civic issues reported
- `issue_votes` - Upvotes on issues
- `issue_media` - Photos/media attached to issues
- `ai_verification_jobs` - Status of AI verification
- `issue_status_changes` - Audit trail of status changes

---

## Frontend Integration

### Environment Variables (.env)

```
VITE_API_URL=http://localhost:8000
```

### API Client Setup (TypeScript)

See `src/api/client.ts` for implementation.

Base URL: `process.env.VITE_API_URL || "http://localhost:8000"`

All requests include:
```
Authorization: Bearer {access_token}
```

Stored in `localStorage.civic_auth_token`

---

## Deployment

See DEPLOYMENT.md for complete setup on Railway, Render, or Fly.io
