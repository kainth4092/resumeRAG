import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.tracker.services.tracker_service import TrackerService
from app.schemas.tracker import TrackedJobResponse, UpdateJobStatusRequest

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/tracker",
    tags=["Tracker"],
)


@router.get("/", response_model=list[TrackedJobResponse])
def get_tracked_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return TrackerService.get_tracked_jobs(db, user_id=current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in get_tracked_jobs: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )


@router.patch("/{job_id}", response_model=TrackedJobResponse)
def update_job_status(
    job_id: str,
    payload: UpdateJobStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        job = TrackerService.update_job_status(
            db,
            user_id=current_user.id,
            job_id=job_id,
            status=payload.status,
        )
        if not job:
            raise HTTPException(status_code=404, detail="Tracked job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in update_job_status: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )


@router.delete("/{job_id}")
def delete_tracked_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        success = TrackerService.delete_tracked_job(
            db,
            user_id=current_user.id,
            job_id=job_id,
        )
        if not success:
            raise HTTPException(status_code=404, detail="Tracked job not found")
        return {"message": "Tracked job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in delete_tracked_job: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )
