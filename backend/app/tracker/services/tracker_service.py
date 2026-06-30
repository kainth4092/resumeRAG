from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user_jobs import UserJob
from app.tracker.repository.tracker_repository import TrackerRepository

class TrackerService:

    @staticmethod
    def save_job(
        db: Session,
        user_id: int,
        job,
    ) -> UserJob:
        existing = TrackerRepository.get_tracked_job(db, user_id, job.job_id)
        if existing:
            return existing

        new_job = UserJob(
            user_id=user_id,
            job_id=job.job_id,
            company_name=job.company_name,
            job_title=job.job_title,
            company_logo=job.company_logo,
            location=job.location,
            employment_type=job.employment_type,
            apply_url=job.apply_url,
            posted_at=job.posted_at,
            status="Saved",
        )

        return TrackerRepository.create_tracked_job(db, new_job)

    @staticmethod
    def get_tracked_jobs(db: Session, user_id: int) -> list[UserJob]:
        return TrackerRepository.get_tracked_jobs(db, user_id)

    @staticmethod
    def update_job_status(db: Session, user_id: int, job_id: str, status: str) -> UserJob | None:
        job = TrackerRepository.get_tracked_job(db, user_id, job_id)
        if not job:
            return None

        job.status = status
        if status.lower() == "applied":
            job.applied_at = datetime.utcnow()
        elif status.lower() == "viewed":
            job.viewed_at = datetime.utcnow()

        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def delete_tracked_job(db: Session, user_id: int, job_id: str) -> bool:
        job = TrackerRepository.get_tracked_job(db, user_id, job_id)
        if not job:
            return False

        TrackerRepository.delete_tracked_job(db, job)
        return True
