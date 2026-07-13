from sqlalchemy.orm import Session
from app.models.resume import Resume

class ResumeRepository:
    @staticmethod
    def get_resume_by_id(db: Session, resume_id: int, user_id: int) -> Resume | None:
        return (
            db.query(Resume)
            .filter(Resume.id == resume_id, Resume.user_id == user_id)
            .first()
        )

    @staticmethod
    def deactivate_all_resumes(db: Session, user_id: int) -> None:
        db.query(Resume).filter(Resume.user_id == user_id).update(
            {Resume.is_active: False}
        )

    @staticmethod
    def create_resume(db: Session, resume: Resume) -> Resume:
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def list_resumes_desc(db: Session, user_id: int) -> list[Resume]:
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
            .all()
        )

    @staticmethod
    def get_active_resume(db: Session, user_id: int) -> Resume | None:
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id, Resume.is_active)
            .first()
        )
