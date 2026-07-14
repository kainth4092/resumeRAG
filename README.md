# ResuPilot AI

ResuPilot AI is a full-stack resume analysis, job discovery, interview prep, and email workflow application built with FastAPI, PostgreSQL, Qdrant, and React + Vite.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- AI / Search: OpenRouter, Qdrant, Ollama, Faster-Whisper
- Frontend: React, Vite, Axios, Tailwind CSS, Recharts

## Project Structure

- `backend/` FastAPI application, Alembic migrations, services, and API routes.
- `frontend/` React application and UI features.
- `render.yaml` Render deployment definition.

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
