from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    resume_id = Column(
        Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False
    )
    company = Column(String(255), nullable=True)
    role = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
    )

    @property
    def questions_count(self) -> int:
        return len(self.questions)

    @property
    def avg_score(self) -> float:
        scores = []
        for q in self.questions:
            if q.answers:
                scores.append(q.answers[-1].overall_score)
        return round(sum(scores) / len(scores)) if scores else 0



class InterviewQuestion(Base):

    __tablename__ = "interview_questions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    category = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)
    tip = Column(JSONB, nullable=True)
    answer = Column(JSONB, nullable=True)
    key_points = Column(JSONB, nullable=True)
    common_mistakes = Column(JSONB, nullable=True)
    follow_up_questions = Column(JSONB, nullable=True)
    bookmarked = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship(
        "InterviewSession",
        back_populates="questions",
    )
    answers = relationship(
        "InterviewAnswer",
        back_populates="question",
        cascade="all, delete-orphan",
    )

    @property
    def answered(self) -> bool:
        return len(self.answers) > 0

    @property
    def user_answer(self) -> str:
        return self.answers[-1].user_answer if self.answers else ""

    @property
    def evaluation(self):
        if not self.answers:
            return None
        ans = self.answers[-1]
        import json
        try:
            feedback_data = json.loads(ans.feedback)
        except Exception:
            feedback_data = {"feedback": ans.feedback, "strengths": [], "weaknesses": [], "missing_points": []}
        return {
            "overall": ans.overall_score,
            "technical": ans.technical_score,
            "communication": ans.communication_score,
            "confidence": ans.confidence_score,
            "strengths": feedback_data.get("strengths", []),
            "weaknesses": feedback_data.get("weaknesses", []),
            "missingPoints": feedback_data.get("missing_points", []),
            "feedback": feedback_data.get("feedback", ""),
            "improvedAnswer": ans.improved_answer or "",
            "followUps": self.follow_up_questions or []
        }



class InterviewAnswer(Base):

    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(
        Integer,
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_answer = Column(Text, nullable=False)
    overall_score = Column(Float, default=0)
    technical_score = Column(Float, default=0)
    communication_score = Column(Float, default=0)
    confidence_score = Column(Float, default=0)
    feedback = Column(Text)
    improved_answer = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    question = relationship(
        "InterviewQuestion",
        back_populates="answers",
    )
