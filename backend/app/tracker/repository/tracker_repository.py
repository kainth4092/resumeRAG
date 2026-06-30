from sqlalchemy.orm import Session
from app.models.user_jobs import UserJob

class TrackerRepository:
    @staticmethod
    def get_tracked_job(db: Session, user_id: int, job_id: str) -> UserJob | None:
        return (
            db.query(UserJob)
            .filter(
                UserJob.user_id == user_id,
                UserJob.job_id == job_id,
            )
            .first()
        )

    @staticmethod
    def get_tracked_jobs(db: Session, user_id: int) -> list[UserJob]:
        return db.query(UserJob).filter(UserJob.user_id == user_id).all()

    @staticmethod
    def create_tracked_job(db: Session, new_job: UserJob) -> UserJob:
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job

    @staticmethod
    def delete_tracked_job(db: Session, job: UserJob) -> None:
        db.delete(job)
        db.commit()
