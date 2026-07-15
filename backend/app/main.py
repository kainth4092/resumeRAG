import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import Base, engine
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AppException
import app.models

from app.api.auth.routes import router as auth_router
from app.api.profile.routes import router as profile_router
from app.api.resume.routes import router as resume_router
from app.api.generator.routes import router as generator
from app.api.skills.routes import router as skills_router
from app.api.projects.routes import router as projects_router
from app.api.education.routes import router as education_router
from app.api.experience.routes import router as experience_router
from app.api.interview.routes import router as interview_router
from app.api.interview_bank.routes import router as interview_bank_router
from app.api.bookmark.routes import router as bookmark_router
from app.api.jobs.routes import router as jobs_router
from app.api.tracker.routes import router as tracker_router
from app.api.email.routes import router as email_router
from app.api.dashboard.routes import router as dashboard_router
from app.api.mock_interview.routes import router as mock_interview_router
from app.api.roadmap.routes import router as roadmap_router
from app.api.notifications.routes import router as notifications_router
from app.api.settings.routes import router as settings_router


logger = logging.getLogger(__name__)


logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

for noisy_logger_name in ("sqlalchemy.engine", "httpcore", "httpx"):
    logging.getLogger(noisy_logger_name).setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from app.services.qdrant_service import COLLECTION_NAME

    print(f"[STARTUP] Active QDRANT_URL: {settings.QDRANT_URL}")
    print(f"[STARTUP] Active Qdrant collection: {COLLECTION_NAME}")
    logger.info("Active QDRANT_URL: %s", settings.QDRANT_URL)
    logger.info("Active Qdrant collection: %s", COLLECTION_NAME)
    try:
        from app.services.qdrant_service import ensure_collection_exists

        ensure_collection_exists()
    except Exception as exc:
        logger.warning("Qdrant initialization skipped: %s", exc)

    try:
        from app.services.ai import get_ai_provider

        provider = get_ai_provider()
        provider.validate_startup()
    except Exception as exc:
        logger.warning("AI Provider startup validation skipped/failed: %s", exc)
    yield


app = FastAPI(title="ResuPilot AI API", version="1.0.0", lifespan=lifespan)


def _error(detail: str, status_code: int) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


FIELD_LABEL_OVERRIDES = {
    "ats_score": "ATS score",
    "api_key": "API key",
    "email": "Email",
    "id": "ID",
    "job_description": "Job description",
    "resume_id": "Resume ID",
    "section_name": "Section name",
    "url": "URL",
}


def _get_validation_field(field_path) -> str | None:
    """Return the final user-editable field from a Pydantic error location."""
    if not field_path:
        return None

    for part in reversed(field_path):
        if isinstance(part, str) and part not in {"body", "query", "path", "header"}:
            return part

    return None


def _format_field_label(field: str | None) -> str:
    """Convert backend field names into readable user-facing labels."""
    if not field:
        return "Input"

    if field in FIELD_LABEL_OVERRIDES:
        return FIELD_LABEL_OVERRIDES[field]

    return field.replace("_", " ").strip().capitalize()


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    errors = exc.errors()

    if not errors:
        return JSONResponse(
            status_code=422,
            content={
                "detail": "The submitted data is invalid. Please check your input.",
                "error_code": "VALIDATION_ERROR",
                "field": None,
            },
        )

    first_error = errors[0]

    field_path = first_error.get("loc", [])
    field = _get_validation_field(field_path)
    field_label = _format_field_label(field)

    error_type = first_error.get("type", "")
    ctx = first_error.get("ctx") or {}

    if error_type == "missing":
        message = f"{field_label} is required."

    elif error_type == "string_too_short":
        min_length = ctx.get("min_length")
        message = (
            f"{field_label} is too short. "
            f"Please enter at least {min_length} characters."
        )

    elif error_type == "string_too_long":
        max_length = ctx.get("max_length")
        message = (
            f"{field_label} is too long. "
            f"Please enter no more than {max_length} characters."
        )

    elif error_type in {"string_type", "string_unicode"}:
        message = f"{field_label} must be valid text."

    elif error_type in {"int_type", "int_parsing"}:
        message = f"{field_label} must be a valid whole number."

    elif error_type in {"float_type", "float_parsing"}:
        message = f"{field_label} must be a valid number."

    elif error_type in {"bool_type", "bool_parsing"}:
        message = f"{field_label} must be true or false."

    elif error_type == "greater_than":
        message = f"{field_label} must be greater than {ctx.get('gt')}."

    elif error_type == "greater_than_equal":
        message = (
            f"{field_label} must be greater than or equal to "
            f"{ctx.get('ge')}."
        )

    elif error_type == "less_than":
        message = f"{field_label} must be less than {ctx.get('lt')}."

    elif error_type == "less_than_equal":
        message = (
            f"{field_label} must be less than or equal to "
            f"{ctx.get('le')}."
        )

    elif error_type == "list_type":
        message = f"{field_label} must be a valid list."

    elif error_type == "too_short":
        min_length = ctx.get("min_length")
        message = (
            f"{field_label} must contain at least "
            f"{min_length} item{'s' if min_length != 1 else ''}."
        )

    elif error_type == "too_long":
        max_length = ctx.get("max_length")
        message = (
            f"{field_label} must contain no more than "
            f"{max_length} item{'s' if max_length != 1 else ''}."
        )

    elif error_type == "json_invalid":
        field = None
        message = "The request body contains invalid JSON."

    elif error_type == "value_error":
        raw_message = str(first_error.get("msg", "Invalid value."))
        message = raw_message.removeprefix("Value error, ").strip()

        if message:
            message = message[0].upper() + message[1:]
            if message[-1] not in ".!?":
                message += "."
        else:
            message = f"{field_label} contains an invalid value."

    else:
        raw_message = str(first_error.get("msg", "Invalid input.")).strip()

        if raw_message:
            raw_message = raw_message[0].upper() + raw_message[1:]
            if raw_message[-1] not in ".!?":
                raw_message += "."

        message = f"{field_label}: {raw_message}"

    return JSONResponse(
        status_code=422,
        content={
            "detail": message,
            "error_code": "VALIDATION_ERROR",
            "field": field,
        },
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database error: %s", exc, exc_info=True)
    return _error("Database error occurred.", 500)


@app.exception_handler(JWTError)
async def jwt_exception_handler(request: Request, exc: JWTError):
    return _error("Invalid authentication token.", 401)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return _error(exc.message, getattr(exc, "status_code", 500))


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled server error: %s", exc, exc_info=True)
    return _error("Internal server error.", 500)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(generator)
app.include_router(skills_router)
app.include_router(projects_router)
app.include_router(education_router)
app.include_router(experience_router)

app.include_router(interview_router)
app.include_router(interview_bank_router)
app.include_router(bookmark_router)
app.include_router(jobs_router)
app.include_router(tracker_router)
app.include_router(email_router)
app.include_router(dashboard_router)
app.include_router(mock_interview_router)
app.include_router(roadmap_router)
app.include_router(notifications_router)
app.include_router(settings_router)


@app.get("/")
def home():
    return {"message": "ResuPilot AI API Running"}


@app.get("/health", include_in_schema=False)
def health(db=Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0",
    }
