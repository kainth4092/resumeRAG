import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import JobNotFoundException
from app.jobs.services.jsearch_service import JSearchService
from app.jobs.services.jobs_service import JobsService
from app.tracker.services.tracker_service import TrackerService
from app.schemas.tracker import SaveJobRequest, TrackedJobResponse
from app.services.notification_service import create_notification


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("/search")
async def search_jobs(
    query: str,
    location: str | None = None,
    employment_type: str | None = None,
    remote: str | None = None,
    page: int = 1,
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
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in search_jobs: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/recommended")
async def recommended_jobs(
    location: str | None = None,
    employment_type: str | None = None,
    remote: str | None = None,
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in recommended_jobs: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{job_id}")
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JSearchService.get_job(db, job_id)

    except JobNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
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
