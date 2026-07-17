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
            .filter(
                Resume.user_id == user_id,
                Resume.is_generated.is_(True),
            )
            .order_by(Resume.created_at.desc())
            .all()
        )

    @staticmethod
    def get_active_resume(db: Session, user_id: int) -> Resume | None:
        return (
            db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active).first()
        )

    @staticmethod
    def delete_resume(db: Session, resume: Resume) -> None:
        # Delete related resume health analysis
        from app.models.resume_health import ResumeHealthAnalysis
        from app.models.interview import InterviewSession

        db.query(ResumeHealthAnalysis).filter(
            ResumeHealthAnalysis.resume_id == resume.id
        ).delete()

        # Delete interview sessions (associated questions will cascade delete due to delete-orphan cascade on session)
        sessions = (
            db.query(InterviewSession)
            .filter(InterviewSession.resume_id == resume.id)
            .all()
        )
        for session in sessions:
            db.delete(session)

        db.delete(resume)
