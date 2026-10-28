import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path as ApiPath,
    Query,
)
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from pydantic import BaseModel
from app.core.exceptions import JobNotFoundException, JobsProviderError
from app.models.user_jobs import UserJob
from app.jobs.services.jsearch_service import JSearchService
from app.jobs.services.jobs_service import JobsService
from app.tracker.services.tracker_service import TrackerService
from app.schemas.tracker import SaveJobRequest, TrackedJobResponse
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


class JobNotesUpdate(BaseModel):
    notes: str | None = None


@router.get("/search")
async def search_jobs(
    query: str = Query(
        ...,
        min_length=2,
        max_length=200,
    ),
    location: str | None = Query(
        default=None,
        max_length=100,
    ),
    employment_type: str | None = Query(
        default=None,
        max_length=30,
    ),
    remote: str | None = Query(
        default=None,
        pattern="^(yes|no)$",
    ),
    date_posted: str | None = Query(
        default=None,
        pattern="^(all|today|3days|week|month)$",
    ),
    country: str | None = Query(
        default=None,
        max_length=10,
    ),
    page: int = Query(
        default=1,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JSearchService.search_jobs(
            db,
            query=query,
            page=page,
            location=location,
            employment_type=employment_type,
            remote=remote,
            date_posted=date_posted,
            country=country,
        )
    except JobsProviderError as jpe:
        logger.warning("JobsProviderError in search_jobs: %s", jpe.message)
        return {"jobs": [], "error": jpe.message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in search_jobs: %s", str(e), exc_info=True)
        return {"jobs": [], "error": "Failed to fetch jobs from provider."}


@router.get("/recommended")
async def recommended_jobs(
    location: str | None = Query(
        default=None,
        max_length=100,
    ),
    employment_type: str | None = Query(
        default=None,
        max_length=30,
    ),
    remote: str | None = Query(
        default=None,
        pattern="^(yes|no)$",
    ),
    country: str | None = Query(
        default=None,
        max_length=10,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JobsService.get_recommended_jobs(
            db,
            current_user=current_user,
            location=location,
            employment_type=employment_type,
            remote=remote,
        )
    except JobsProviderError as jpe:
        logger.warning("JobsProviderError in recommended_jobs: %s", jpe.message)
        return {"jobs": [], "error": jpe.message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in recommended_jobs: %s", str(e), exc_info=True)
        return {"jobs": [], "error": "Failed to fetch recommended jobs."}


@router.get("/{job_id}/notes")
def get_job_notes(
    job_id: str = ApiPath(..., min_length=1, max_length=255),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(UserJob)
        .filter(UserJob.job_id == job_id, UserJob.user_id == current_user.id)
        .first()
    )
    return {"job_id": job_id, "notes": job.notes if job else None}


@router.put("/{job_id}/notes")
def update_job_notes(
    job_id: str = ApiPath(..., min_length=1, max_length=255),
    payload: JobNotesUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(UserJob)
        .filter(UserJob.job_id == job_id, UserJob.user_id == current_user.id)
        .first()
    )
    if not job:
        # Create tracked entry if user is adding notes to an un-saved job
        job = UserJob(
            user_id=current_user.id,
            job_id=job_id,
            company_name="Tracked Job",
            job_title="Job Notes",
            notes=payload.notes,
            status="Viewed",
        )
        db.add(job)
    else:
        job.notes = payload.notes

    db.commit()
    db.refresh(job)
    return {"job_id": job.job_id, "notes": job.notes}


@router.get("/{job_id}")
async def get_job(
    job_id: str = ApiPath(
        ...,
        min_length=1,
        max_length=255,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JSearchService.get_job(db, job_id)

    except JobNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except JobsProviderError as jpe:
        raise HTTPException(status_code=jpe.status_code, detail=jpe.message)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in get_job: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/save", response_model=TrackedJobResponse)
async def save_job(
    request: SaveJobRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        job = TrackerService.save_job(
            db,
            current_user.id,
            request,
        )

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Job saved successfully",
            message=(
                f'You saved the "{job.job_title}" position ' f"at {job.company_name}."
            ),
            notification_type="job",
            action_url="/tracker",
        )

        return job

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            "Error in save_job: %s",
            str(e),
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )
