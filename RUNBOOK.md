# ResuPilot AI — Operations & Disaster Recovery Runbook

This runbook defines emergency procedures, maintenance protocols, rollback strategies, and provider outage mitigations for operating ResuPilot AI in staging and production environments.

---

## 🚨 Table of Contents
1. [Health Checks & Incident Triage](#1-health-checks--incident-triage)
2. [Disaster Recovery & Database Backups](#2-disaster-recovery--database-backups)
3. [Alembic Migration Rollback & Head Stamping](#3-alembic-migration-rollback--head-stamping)
4. [API Key & Secret Rotation](#4-api-key--secret-rotation)
5. [AI Provider Outage & Fallback Handling](#5-ai-provider-outage--fallback-handling)
6. [Vector Search (Qdrant) Outage Handling](#6-vector-search-qdrant-outage-handling)
7. [Email & SMTP Delivery Failure Runbook](#7-email--smtp-delivery-failure-runbook)

---

## 1. Health Checks & Incident Triage

### Liveness & Readiness Endpoints
- **Liveness probe**: `GET /health`
  - Returns `200 {"status": "healthy", "service": "resupilot-backend"}`
- **Readiness probe**: `GET /ready`
  - Validates PostgreSQL database connectivity and Qdrant cluster connectivity.
  - Returns `200 {"status": "ready", "database": "connected", "qdrant": "connected"}`.
  - Returns `503 Service Unavailable` if PostgreSQL connection fails.

### Immediate Triage Protocol
```bash
# 1. Check container/process status
ps aux | grep uvicorn

# 2. Inspect application stderr/stdout logs
journalctl -u resupilot-backend -n 100 --no-pager

# 3. Test readiness probe directly
curl -i http://localhost:8000/ready
```

---

## 2. Disaster Recovery & Database Backups

### Automated Periodic Backup (PostgreSQL)
Ensure automated pg_dump runs daily:
```bash
pg_dump -U $POSTGRES_USER -h $POSTGRES_HOST -d $POSTGRES_DB -Fc > /backups/resupilot_$(date +%Y%m%d_%H%M%S).dump
```

### Full Database Restore Procedure
In the event of database corruption or hardware catastrophic failure:
```bash
# 1. Terminate all active backend instances to prevent writes
sudo systemctl stop resupilot-backend

# 2. Drop corrupted database and re-create blank target
dropdb -U $POSTGRES_USER -h $POSTGRES_HOST $POSTGRES_DB
createdb -U $POSTGRES_USER -h $POSTGRES_HOST $POSTGRES_DB

# 3. Restore from the most recent verified dump
pg_restore -U $POSTGRES_USER -h $POSTGRES_HOST -d $POSTGRES_DB /backups/resupilot_latest.dump

# 4. Verify Alembic migration version match
cd /home/kanish/Documents/Resume-Rag/backend
alembic current

# 5. Restart backend services
sudo systemctl start resupilot-backend
```

---

## 3. Alembic Migration Rollback & Head Stamping

### Single Step Rollback
If a migration introduces a locking issue or regression:
```bash
cd backend
source venv/bin/activate

# Roll back the single most recent migration
alembic downgrade -1
```

### Target Revision Downgrade
```bash
# Roll back to specific revision hash
alembic downgrade 98e29bc2bb04
```

### Stamping Alembic Head (Resolving Out-of-Sync Schema)
When tables have been applied manually or synced via hotfix DDL without an Alembic record:
```bash
# Check current DB revision
alembic current

# Check available heads
alembic heads

# Force stamp database metadata table to HEAD without executing SQL
alembic stamp head
```

---

## 4. API Key & Secret Rotation

### `JWT_SECRET` Rotation
> [!WARNING]
> Rotating `JWT_SECRET` immediately invalidates all existing active user sessions. Users will be required to re-authenticate.

1. Generate a cryptographically secure 256-bit random hex string:
   ```bash
   openssl rand -hex 32
   ```
2. Update `JWT_SECRET` in production `.env` / secret manager.
3. Perform a zero-downtime rolling restart of backend worker processes.
4. Verify `/ready` returns 200.

### `OPENROUTER_API_KEY` Rotation
1. Generate new API key in OpenRouter console.
2. Update `OPENROUTER_API_KEY` in environment.
3. Reload backend workers:
   ```bash
   sudo systemctl reload resupilot-backend
   ```
4. Run integration test to verify AI provider connectivity:
   ```bash
   pytest tests/test_ai_provider.py
   ```

---

## 5. AI Provider Outage & Fallback Handling

ResuPilot's architecture decouples AI generation behind `app/services/ai_provider.py`:
- Primary Provider: OpenRouter (Gemini / Claude / GPT models).
- Secondary Fallback: Ollama local models (`http://localhost:11434`).
- Testing/Emergency Fallback: Deterministic `FakeAIProvider`.

### Mitigation During OpenRouter Outage
If OpenRouter experiences major downtime or upstream rate-limiting:
1. Switch provider to local Ollama by setting:
   ```bash
   OPENROUTER_API_KEY=""
   OLLAMA_BASE_URL="http://127.0.0.1:11434"
   ```
2. Or deploy backup API key from alternative provider.
3. The deterministic verification layer (`app/services/generation_validator.py`) guarantees that even under model degradation, hallucinations in metrics, skills, or dates are rejected with HTTP 422 before reaching the user.

---

## 6. Vector Search (Qdrant) Outage Handling

If Qdrant becomes unreachable or out of memory:
1. Check container status:
   ```bash
   docker ps | grep qdrant
   docker logs qdrant --tail 100
   ```
2. Restart Qdrant container:
   ```bash
   docker restart qdrant
   ```
3. Job recommendations and skill matching automatically fall back to SQL keyword/category matching if vector search client throws `UnexpectedResponse` or connection timeout.

---

## 7. Email & SMTP Delivery Failure Runbook

1. Check outbound port connectivity:
   ```bash
   nc -zv $SMTP_HOST $SMTP_PORT
   ```
2. Inspect authentication credentials in `.env`:
   - Verify `SMTP_USER` and `SMTP_PASS` (ensure Gmail 16-character App Password is used, not standard password).
3. Check `backend/app/services/email_service.py` logs for TLS handshake or rate limiting exceptions.
