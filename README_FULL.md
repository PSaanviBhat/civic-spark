# Civic Spark - Full System Guide

Full-stack civic issue reporting platform with a Vite/React frontend, FastAPI backend, PostgreSQL, AWS S3 uploads, and AWS Rekognition-based image verification.

This repository contains both the frontend and backend used in local development and cloud deployment.

---

## Overview

Current app capabilities:
- JWT-based register/login flow
- Home feed backed by API data
- Interactive map with working search and filters
- Report issue flow with device location + S3 photo upload
- AI verification status stored on issues
- Upvote, track, and close issue flows
- Leaderboard and profile backed by real backend data
- Profile sections for notifications, privacy, support, and settings

Current constraints:
- Notifications/profile settings are local UI preferences, not persisted yet
- Close issue is currently limited to the original reporter
- Rekognition verification is real, but verification rules are intentionally basic
- No admin dashboard yet

---

## Project Structure

```text
civic-spark/
|-- src/
|   |-- api/
|   |   |-- client.ts
|   |   `-- endpoints/
|   |-- components/
|   |   |-- common/
|   |   |-- gamification/
|   |   |-- issue/
|   |   `-- ui/
|   |-- config/
|   |-- constants/
|   |-- data/
|   |-- hooks/
|   |   `-- api/
|   |-- lib/
|   |-- pages/
|   |-- styles/
|   |-- types/
|   `-- views/
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- utils/
|   |-- .env.example
|   |-- Dockerfile
|   |-- docker-compose.yml
|   |-- main.py
|   `-- requirements.txt
|-- DEPLOYMENT.md
|-- FRONTEND_INTEGRATION.md
|-- FRONTEND_REORGANIZATION.md
|-- FRONTEND_STRUCTURE_GUIDE.md
`-- README_FULL.md
```

---

## Frontend Architecture

Important frontend files:
- App entry: [src/main.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/main.tsx)
- Router shell: [src/App.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/App.tsx)
- Auth gate + tabs: [src/pages/Index.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/pages/Index.tsx)
- API client: [src/api/client.ts](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/api/client.ts)
- Views:
  - [src/views/AuthView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/AuthView.tsx)
  - [src/views/HomeView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/HomeView.tsx)
  - [src/views/MapView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/MapView.tsx)
  - [src/views/ReportView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/ReportView.tsx)
  - [src/views/LeaderboardView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/LeaderboardView.tsx)
  - [src/views/ProfileView.tsx](/C:/Users/psaan/Desktop/civic-spark/civic-spark/src/views/ProfileView.tsx)

Frontend behavior:
- stores JWT in `localStorage` under `civic_auth_token`
- uses React Query hooks from `src/hooks/api`
- sends authenticated requests to `VITE_API_URL`
- uploads photos directly to S3 using backend-issued presigned URLs

---

## Backend Architecture

Important backend files:
- Entry point: [backend/main.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/main.py)
- FastAPI app: [backend/app/main.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/main.py)
- Config: [backend/app/config.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/config.py)
- Auth dependency: [backend/app/dependencies.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/dependencies.py)
- Issue routes: [backend/app/routes/issues.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/routes/issues.py)
- AI verification: [backend/app/services/ai.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/services/ai.py)
- S3 helpers: [backend/app/utils/s3.py](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/app/utils/s3.py)

Backend responsibilities:
- registration/login with JWT
- issue persistence in PostgreSQL
- bounding-box issue queries for the map
- tracking and upvoting
- issue resolution
- presigned S3 upload URLs
- Rekognition label/moderation checks after upload
- leaderboard and profile stats

---

## Implemented Features

### Auth
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/me`

### Issues
- create issue
- list issues
- map issues by bbox
- get single issue
- upvote/un-upvote
- track/untrack
- update status to resolved

### Media
- request S3 presigned upload URL
- direct browser-to-S3 upload

### Verification
- moderation check via AWS Rekognition
- label detection via AWS Rekognition
- verification result stored on issue

### Gamification
- XP on report
- XP on adding photo evidence
- daily login XP
- streak tracking
- leaderboard
- profile stats

---

## API Overview

All authenticated requests require:

```text
Authorization: Bearer <token>
```

### Auth

```text
POST /v1/auth/register
POST /v1/auth/login
GET  /v1/auth/me
```

### Issues

```text
POST  /v1/issues
GET   /v1/issues
GET   /v1/issues/map
GET   /v1/issues/{id}
POST  /v1/issues/{id}/upvote
POST  /v1/issues/{id}/track
PATCH /v1/issues/{id}/status
```

### Media

```text
POST /v1/media/presign-upload
```

### Gamification

```text
GET /v1/gamification/leaderboard
GET /v1/gamification/me
```

Swagger docs:

```text
http://localhost:8000/docs
```

---

## Database Tables

Core tables:
- `users`
- `issues`
- `issue_votes`
- `issue_media`
- `issue_followers`
- `issue_status_changes`
- `ai_verification_jobs`

Relationships:
- one user reports many issues
- one issue can have many votes
- one issue can have many media records
- one issue can have many followers

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker Desktop
- AWS account
- S3 bucket
- IAM access key with S3 + Rekognition permissions

### Backend

From [backend](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend):

```bash
docker compose up --build
```

Backend:
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

### Frontend

From repo root [civic-spark](/C:/Users/psaan/Desktop/civic-spark/civic-spark):

```bash
npm install
npm run dev
```

Frontend:
- App: `http://localhost:8080`

---

## Environment Variables

### Frontend

Create [`.env.local`](/C:/Users/psaan/Desktop/civic-spark/civic-spark/.env.local):

```env
VITE_API_URL=http://localhost:8000
```

### Backend

Create [`backend/.env`](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/.env) from [`backend/.env.example`](/C:/Users/psaan/Desktop/civic-spark/civic-spark/backend/.env.example):

```env
DATABASE_URL=postgresql://civic_user:civic_password@localhost:5432/civic_spark

SECRET_KEY=replace-this-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=civic-spark-saanvi-2026
AWS_REGION=ap-southeast-2
AWS_S3_PUBLIC_BASE_URL=
AWS_REKOGNITION_MIN_CONFIDENCE=70

DEBUG=True
ENVIRONMENT=development
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:8000
```

Notes:
- leave `AWS_S3_PUBLIC_BASE_URL` blank for private buckets
- set `AWS_REGION` to your actual bucket region

---

## AWS Setup Notes

For S3 uploads to work:
- bucket CORS must allow `http://localhost:8080`
- IAM user must allow:
  - `s3:PutObject`
  - `s3:GetObject`
  - `s3:DeleteObject`
  - `s3:ListBucket`
  - `rekognition:DetectLabels`
  - `rekognition:DetectModerationLabels`

Example bucket CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:8080",
      "https://your-vercel-app.vercel.app"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## Deployment

### Recommended split
- Frontend: Vercel
- Backend: Railway
- Database: Railway Postgres
- Storage/verification: AWS S3 + Rekognition

### Backend deployment summary
1. Push repo to GitHub
2. Create Railway project
3. Deploy from GitHub repo
4. Set root directory to `/backend`
5. Add Railway PostgreSQL
6. Add backend env vars
7. Generate public Railway domain
8. Set `FRONTEND_URL` to your Vercel app URL

### Frontend deployment summary
1. Import repo into Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_URL=https://your-backend.up.railway.app`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for broader deployment notes.

---

## Manual Test Flow

Use this sequence after local or cloud deploy:

1. Register a new user
2. Log in
3. Create a report with a photo
4. Confirm upload succeeds
5. Open map and find the issue
6. Filter by category/status
7. Upvote the issue
8. Track the issue
9. Close the issue as the original reporter
10. Check leaderboard/profile stats

---

## Common Issues

### `GET /v1/auth/me` returns `401` or `422`
- token missing or invalid
- backend auth dependency was not restarted after code changes

### S3 upload fails with CORS
- bucket CORS missing frontend origin
- browser origin does not match allowed origin exactly

### S3 upload fails with wrong endpoint
- `AWS_REGION` does not match actual bucket region

### Report creation works but image not visible
- private bucket with no `AWS_S3_PUBLIC_BASE_URL`
- backend should generate presigned GET URL, so restart backend after env changes

### Registration/login fails
- stale database user from earlier failed tests
- wrong password
- backend not restarted after auth/security changes

### Map filters show nothing
- current search text too restrictive
- selected status/category combination yields no results

---

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- [FRONTEND_REORGANIZATION.md](./FRONTEND_REORGANIZATION.md)
- [FRONTEND_STRUCTURE_GUIDE.md](./FRONTEND_STRUCTURE_GUIDE.md)
- [backend/API.md](./backend/API.md)

---

## Status Summary

Working now:
- auth
- home feed
- map filtering
- report with photo upload
- S3 integration
- Rekognition verification
- upvote
- track
- close issue
- leaderboard
- profile sections

Still basic:
- admin workflows
- notification persistence
- advanced moderation rules
- real support/settings persistence

---

## Start Here

Local backend:

```bash
cd backend
docker compose up --build
```

Local frontend:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:8080
```
