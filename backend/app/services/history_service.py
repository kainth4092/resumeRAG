import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.mock_interview import MockInterviewSession

logger = logging.getLogger(__name__)


class HistoryService:
    def save_session(
        self,
        db: Session,
        user_id: int,
        interview_type: str,
        duration: int,  # in seconds
        overall_score: int,
        questions_attempted: int,
        performance_summary: str,
        evaluation_report: Dict[str, Any],
    ) -> MockInterviewSession:
        """
        Save a completed mock interview session to the database.
        """
        try:
            session = MockInterviewSession(
                user_id=user_id,
                interview_type=interview_type,
                duration=duration,
                overall_score=overall_score,
                questions_attempted=questions_attempted,
                performance_summary=performance_summary,
                evaluation_report=evaluation_report,
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            logger.info(f"Saved Mock Interview Session {session.id} for user {user_id}")
            return session
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save mock interview session: {e}")
            raise RuntimeError(f"Database error while saving session: {str(e)}")

    def get_history(self, db: Session, user_id: int) -> List[MockInterviewSession]:
        """
        Retrieve all mock interview sessions for a specific user.
        """
        try:
            return (
                db.query(MockInterviewSession)
                .filter(MockInterviewSession.user_id == user_id)
                .order_by(MockInterviewSession.created_at.desc())
                .all()
            )
        except Exception as e:
            logger.error(f"Failed to fetch mock interview history: {e}")
            return []

    def get_session_by_id(
        self, db: Session, session_id: int, user_id: int
    ) -> Optional[MockInterviewSession]:
        """
        Retrieve a specific mock interview session by its ID.
        """
        try:
            return (
                db.query(MockInterviewSession)
                .filter(
                    MockInterviewSession.id == session_id,
                    MockInterviewSession.user_id == user_id,
                )
                .first()
            )
        except Exception as e:
            logger.error(f"Failed to retrieve mock interview session {session_id}: {e}")
            return None


history_service = HistoryService()
