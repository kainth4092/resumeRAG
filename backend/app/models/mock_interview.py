from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    interview_type = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    duration = Column(Integer, nullable=True)
    overall_score = Column(Integer, nullable=True)
    overall_grade = Column(String(10), nullable=True)
    questions_attempted = Column(Integer, nullable=False, default=0)
    performance_summary = Column(Text, nullable=True)

    user = relationship("User")
    answers = relationship(
        "MockInterviewAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="MockInterviewAnswer.id",
    )


class MockInterviewAnswer(Base):
    __tablename__ = "mock_interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("mock_interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id = Column(
        Integer,
        ForeignKey("interview_question_bank.id", ondelete="SET NULL"),
        nullable=True,
    )
    question_text = Column(Text, nullable=False)
    transcript = Column(Text, nullable=True)
    answer_duration = Column(Integer, nullable=True)  # in seconds

    overall_score = Column(Integer, nullable=True)
    technical_score = Column(Integer, nullable=True)
    communication_score = Column(Integer, nullable=True)
    confidence_score = Column(Integer, nullable=True)
    grammar_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)

    strengths = Column(JSONB, nullable=True)
    weaknesses = Column(JSONB, nullable=True)
    improvements = Column(JSONB, nullable=True)
    missing_points = Column(JSONB, nullable=True)
    ideal_answer = Column(Text, nullable=True)

    session = relationship("MockInterviewSession", back_populates="answers")
    question = relationship("InterviewQuestionBank")
