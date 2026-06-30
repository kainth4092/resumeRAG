from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.models.user_jobs import UserJob
from app.models.interview import InterviewSession
from app.models.interview_bank import InterviewQuestionBank

class DashboardRepository:
    @staticmethod
    def get_user_resumes(db: Session, user_id: int):
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id)
            .order_by(Resume.created_at.asc())
            .all()
        )

    @staticmethod
    def get_user_tracked_jobs(db: Session, user_id: int):
        return (
            db.query(UserJob)
            .filter(UserJob.user_id == user_id)
            .all()
        )

    @staticmethod
    def get_user_interviews(db: Session, user_id: int):
        return (
            db.query(InterviewSession)
            .filter(InterviewSession.user_id == user_id)
            .all()
        )

    @staticmethod
    def get_user_community_questions(db: Session, user_id: int):
        return (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.created_by == user_id)
            .all()
        )
