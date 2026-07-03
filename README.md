# ResuPilot AI

ResuPilot AI is a full-stack resume analysis, job discovery, interview prep, and email workflow application built with FastAPI, PostgreSQL, Qdrant, and React + Vite.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- AI / Search: OpenRouter, Qdrant, Ollama, Faster-Whisper
- Frontend: React, Vite, Axios, Tailwind CSS, Recharts

## Installation

1. Create and configure the backend environment variables.
2. Create and configure the frontend environment variables.
3. Install backend dependencies with `pip install -r backend/requirements.txt`.
4. Install frontend dependencies with `npm install` inside `frontend`.

## Environment Variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MODEL`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM_ADDRESS`
- `FRONTEND_URL`
- `ENVIRONMENT`
- `DEBUG`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `WHISPER_MODEL_SIZE`
- `WHISPER_DEVICE`
- `WHISPER_COMPUTE_TYPE`
- `RAPIDAPI_KEY`
- `RAPIDAPI_HOST`

Frontend:

- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_ENVIRONMENT`

## Run Locally

Backend:

```bash
cd backend
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

## Deploy on Render

- Use `render.yaml` at the repo root.
- Backend service root is `backend`.
- Frontend service root is `frontend`.
- Backend health check is `GET /health`.
- Set `VITE_API_URL` to the deployed backend API base URL.

## Project Structure

- `backend/` FastAPI application, Alembic migrations, services, and API routes.
- `frontend/` React application and UI features.
- `render.yaml` Render deployment definition.
- `docker-compose.yml` Local development services.

## API Overview

- `GET /health` Health check.
- `POST /api/auth/register` Register a user.
- `POST /api/auth/login` Login.
- `GET /api/auth/me` Current user profile.
- `POST /api/resume/upload` Upload a resume.
- `POST /api/generator/analyze` Analyze a resume.
- `POST /api/generator/generate` Generate an optimized resume.
- `POST /api/generator/analyze-health` Resume health analysis.
- `POST /api/mock-interview/transcribe` Transcribe interview audio.
- `POST /api/mock-interview/evaluate` Evaluate interview answers.
- `POST /api/email/send` Send a resume via email.

## Notes

- Uploaded resumes are processed with temporary files only.
- Production errors return safe JSON responses.
- CORS is driven by `FRONTEND_URL`.
