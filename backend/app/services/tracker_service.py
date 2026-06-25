from sqlalchemy.orm import Session
from app.models import UserJob
from datetime import datetime


class TrackerService:

    @staticmethod
    def save_job(
        db: Session,
        user_id: str,
        job,
    ):
        existing = (
            db.query(UserJob)
            .filter(
                UserJob.user_id == user_id,
                UserJob.job_id == job.job_id,
            )
            .first()
        )

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

        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job

    @staticmethod
    def get_tracked_jobs(db: Session, user_id: str):
        return db.query(UserJob).filter(UserJob.user_id == user_id).all()

    @staticmethod
    def update_job_status(db: Session, user_id: str, job_id: str, status: str):
        job = (
            db.query(UserJob)
            .filter(
                UserJob.user_id == user_id,
                UserJob.job_id == job_id,
            )
            .first()
        )
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
    def delete_tracked_job(db: Session, user_id: str, job_id: str):
        job = (
            db.query(UserJob)
            .filter(
                UserJob.user_id == user_id,
                UserJob.job_id == job_id,
            )
            .first()
        )
        if not job:
            return False

        db.delete(job)
        db.commit()
        return True
