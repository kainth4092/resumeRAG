from sqlalchemy.orm import Session, joinedload
from app.models.interview import InterviewSession, InterviewQuestion
from app.models.resume import Resume

class InterviewRepository:
    @staticmethod
    def get_resume(db: Session, resume_id: int, user_id: int) -> Resume | None:
        return db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()

    @staticmethod
    def get_user_interview_history(db: Session, user_id: int) -> list[InterviewSession]:
        return (
            db.query(InterviewSession)
            .options(joinedload(InterviewSession.questions))
            .filter(InterviewSession.user_id == user_id)
            .order_by(InterviewSession.created_at.desc())
            .all()
        )

    @staticmethod
    def get_interview_session(db: Session, session_id: int, user_id: int) -> InterviewSession | None:
        return (
            db.query(InterviewSession)
            .options(joinedload(InterviewSession.resume))
            .filter(
                InterviewSession.id == session_id,
                InterviewSession.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def get_interview_question(db: Session, question_id: int, user_id: int) -> InterviewQuestion | None:
        return (
            db.query(InterviewQuestion)
            .join(InterviewSession)
            .filter(
                InterviewQuestion.id == question_id,
                InterviewSession.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def get_question_by_id(db: Session, question_id: int) -> InterviewQuestion | None:
        return db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()

    @staticmethod
    def get_session_by_id(db: Session, session_id: int, user_id: int) -> InterviewSession | None:
        return (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == session_id,
                InterviewSession.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def delete_session(db: Session, session: InterviewSession) -> None:
        db.delete(session)
        db.commit()
