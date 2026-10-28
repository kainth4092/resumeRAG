from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON, Boolean, Float
from sqlalchemy.sql import func
from app.core.database import Base


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_ids = Column(JSON, nullable=False, default=list)
    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    score = Column(Integer, default=0, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    time_taken_seconds = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
