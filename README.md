# ResuPilot AI

ResuPilot AI is a production-grade, end-to-end career acceleration and resume intelligence platform. It couples deterministic NLP verification with LLM-powered optimization, Qdrant semantic vector search, adaptive mock interviews, and automated career roadmap generation.

---

## 🏛 System Architecture

```mermaid
graph TD
    Client["Client Browser (React 19 + Vite + Tailwind CSS)"]

    subgraph FastAPIGateway ["FastAPI Application Gateway (Port 8000)"]
        AuthMiddleware["Auth & Rate Limit Middleware (SlowAPI + PyJWT)"]
        RouterAuth["/api/auth (JWT, Argon2id, Google OAuth)"]
        RouterResume["/api/resume (Upload, Parser, Scoring)"]
        RouterPipeline["/api/pipeline (Async Multi-Step Orchestrator)"]
        RouterJobs["/api/jobs (Semantic Ranking + Deduplication)"]
        RouterInterview["/api/interview (Bank, Sessions, Challenge Grading)"]
        RouterRoadmap["/api/roadmap (Gap Analysis, Stable Milestones)"]
        RouterEmail["/api/email (SMTP Outbound Delivery)"]
    end

    subgraph DataPersistence ["Persistence & Search Engines"]
        Postgres[("PostgreSQL Database (SQLAlchemy 2.0 + Alembic)")]
        QdrantDB[("Qdrant Vector DB (Hybrid Semantic Retrieval)")]
    end

    subgraph AIProviders ["AI Providers & Pipeline Services"]
        LLMAdapter["Unified AI Provider (OpenRouter / Ollama / Local)"]
        WhisperSTT["Faster-Whisper (Audio Transcription)"]
        DeterministicValidator["Generation Validator (Anti-Hallucination Guard)"]
    end

    Client -->|"REST APIs + Bearer Token"| FastAPIGateway
    FastAPIGateway --> AuthMiddleware
    AuthMiddleware --> RouterAuth & RouterResume & RouterPipeline & RouterJobs & RouterInterview & RouterRoadmap & RouterEmail

    RouterAuth --> Postgres
    RouterResume --> Postgres
    RouterPipeline --> Postgres
    RouterPipeline --> DeterministicValidator
    DeterministicValidator --> LLMAdapter
    RouterJobs --> Postgres & QdrantDB
    RouterInterview --> Postgres
    RouterRoadmap --> Postgres & LLMAdapter
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in `backend/` and configure the following variables:

| Variable | Description | Required / Default | Example |
|---|---|---|---|
| `ENVIRONMENT` | Deployment environment (`development` / `production` / `testing`) | `development` | `production` |
| `DATABASE_URL` | PostgreSQL connection URI | **Required** | `postgresql://user:pass@localhost:5432/resupilot` |
| `JWT_SECRET` | Secret key for signing HS256 auth tokens | **Required** (min 32 chars in prod) | `c9f8e7d6b5a41234567890abcdef1234` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan in minutes | `1440` (24h) | `1440` |
| `OPENROUTER_API_KEY` | OpenRouter API Key for generative LLM calls | Optional (falls back to Fake/Ollama) | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | Default model for OpenRouter | `google/gemini-2.0-flash-001` | `google/gemini-2.0-flash-001` |
| `QDRANT_URL` | Qdrant vector database URL | `http://localhost:6333` | `https://xyz.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant cloud authentication token | Optional | `qdrant-secret-key` |
| `FRONTEND_URL` | Allowed origin for CORS headers | `http://localhost:5173` | `https://resupilot.ai` |
| `SMTP_HOST` | Outbound SMTP host for resume emailer | Optional | `smtp.gmail.com` |
| `SMTP_PORT` | Outbound SMTP port | `587` | `587` |
| `SMTP_USER` | SMTP username / sender account | Optional | `team@resupilot.ai` |
| `SMTP_PASS` | SMTP application password | Optional | `secretapppassword` |
| `RAPIDAPI_KEY` | RapidAPI key for live external job search | Optional | `rapidapi-key-...` |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm 10+
- PostgreSQL 15+
- (Optional) Qdrant vector database (`docker run -p 6333:6333 qdrant/qdrant`)

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial interview bank questions and mock jobs
python -m app.scripts.seed_interview_bank
python -m app.scripts.seed_jobs

# Start development API server (Port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server (Port 5173)
npm run dev
```

The frontend will start at `http://localhost:5173` and proxy `/api/*` requests to `http://localhost:8000`.

---

## 🗄 Database Migrations (Alembic)

```bash
cd backend

# Create a new migration revision
alembic revision --autogenerate -m "describe_schema_change"

# Apply all pending migrations to HEAD
alembic upgrade head

# Rollback single migration step
alembic downgrade -1

# Stamp current DB state without running SQL
alembic stamp head
```

---

## 🧪 Testing & Quality Assurance

ResuPilot maintains a strict **0 warnings, 0 errors** policy across all test and linting suites.

### 1. Backend Test Suite (Pytest)
```bash
cd backend
venv/bin/pytest -v
```
- **40 tests passing**: Covers IDOR isolation, upload validation, parser regression, anti-hallucination validator, scoring algorithms, and challenge attempt grading.

### 2. Frontend Unit Tests (Vitest)
```bash
cd frontend
npm run test
```
- **17 tests passing**: Covers `resumeModel` normalization, date formatting, and `pipelinePolling` exponential backoff cap.

### 3. Frontend ESLint
```bash
cd frontend
npm run lint
```
- Validates 0 errors and 0 warnings with zero blanket disables.

### 4. End-to-End Smoke Test (Playwright)
```bash
cd frontend
npx playwright test
```
- Executes full user journey: register -> upload resume -> pipeline run -> jobs -> interview prep -> roadmap -> PDF export.

---

## 📦 Production Build

```bash
cd frontend
npm run build
```
Build artifacts are bundled to `frontend/dist` with code-split chunks for high-performance delivery.
