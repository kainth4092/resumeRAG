from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    candidate_type = Column(String(20), nullable=False)
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
    resume = relationship("Resume")

    @property
    def questions_count(self) -> int:
        return len(self.questions)

    @property
    def resume_title(self) -> str:
        return self.resume.title if self.resume else "None"


class InterviewQuestion(Base):

    __tablename__ = "interview_questions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    category = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)
    estimated_duration = Column(String(30), nullable=True)
    tech_skill = Column(String(100), nullable=True)
    answer = Column(JSON, nullable=True)
    details_generated = Column(Boolean, default=False)
    bookmarked = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship(
        "InterviewSession",
        back_populates="questions",
    )
