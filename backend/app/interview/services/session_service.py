from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.interview import InterviewSession, InterviewQuestion


class InterviewSessionService:
    @staticmethod
    def create_session(
        db: Session,
        user_id: int,
        resume_id: int,
        company: Optional[str],
        role: Optional[str],
        candidate_type: str,
        job_description: str,
    ) -> InterviewSession:
        session = InterviewSession(
            user_id=user_id,
            resume_id=resume_id,
            company=company,
            role=role,
            candidate_type=candidate_type,
            job_description=job_description,
        )
        db.add(session)
        db.flush()
        return session

    @staticmethod
    def add_question_to_session(
        db: Session, session_id: int, question_data: Dict[str, Any]
    ) -> InterviewQuestion:
        q = InterviewQuestion(
            session_id=session_id,
            category=question_data.get("category", "Technical"),
            question=question_data.get("question", ""),
            difficulty=question_data.get("difficulty", "Medium"),
            estimated_duration=question_data.get("estimated_duration", "2-3 minutes"),
            tech_skill=question_data.get("tech_skill"),
            answer=question_data.get("answer"),
            details_generated=bool(question_data.get("answer")),
            bookmarked=False,
        )
        db.add(q)
        return q

    @staticmethod
    def get_session_progress(session: InterviewSession) -> Dict[str, Any]:
        """
        Calculates selected vs completed questions and placeholder score/feedback.
        """
        questions = session.questions
        total = len(questions)
        completed = sum(1 for q in questions if q.details_generated)

        return {
            "session_id": session.id,
            "total_questions": total,
            "completed_questions": completed,
            "progress_percentage": (completed / total * 100) if total > 0 else 0,
            "final_score_placeholder": None,  # Future manual scoring logic
            "feedback_placeholder": None,  # Future manual feedback evaluation
        }
