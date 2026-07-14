from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.models.user_jobs import UserJob
from app.models.interview import InterviewSession
from app.models.interview_bank import InterviewQuestionBank
from app.models.mock_interview import MockInterviewSession
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_experience import UserExperience
from app.models.user_education import UserEducation


class DashboardRepository:

    @staticmethod
    def get_user_resumes(db: Session, user_id: int):
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
            .all()
        )

    @staticmethod
    def get_user_resume_health(db: Session, user_id: int):
        return (
            db.query(ResumeHealthAnalysis)
            .join(
                Resume,
                Resume.id == ResumeHealthAnalysis.resume_id,
            )
            .filter(Resume.user_id == user_id)
            .order_by(ResumeHealthAnalysis.id.desc())
            .all()
        )

    @staticmethod
    def get_user_tracked_jobs(db: Session, user_id: int):
        return (
            db.query(UserJob)
            .filter(UserJob.user_id == user_id)
            .order_by(UserJob.created_at.desc())
            .all()
        )

    @staticmethod
    def get_user_interviews(db: Session, user_id: int):
        return (
            db.query(InterviewSession)
            .filter(InterviewSession.user_id == user_id)
            .order_by(InterviewSession.created_at.desc())
            .all()
        )

    @staticmethod
    def get_user_mock_interviews(db: Session, user_id: int):
        return (
            db.query(MockInterviewSession)
            .filter(MockInterviewSession.user_id == user_id)
            .order_by(MockInterviewSession.created_at.desc())
            .all()
        )

    @staticmethod
    def get_user_community_questions(db: Session, user_id: int):
        return (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.created_by == user_id)
            .all()
        )

    @staticmethod
    def get_user_skills(db: Session, user_id: int):
        return db.query(UserSkill).filter(UserSkill.user_id == user_id).all()

    @staticmethod
    def get_user_projects(db: Session, user_id: int):
        return db.query(UserProject).filter(UserProject.user_id == user_id).all()

    @staticmethod
    def get_user_experience(db: Session, user_id: int):
        return db.query(UserExperience).filter(UserExperience.user_id == user_id).all()

    @staticmethod
    def get_user_education(db: Session, user_id: int):
        return db.query(UserEducation).filter(UserEducation.user_id == user_id).all()
