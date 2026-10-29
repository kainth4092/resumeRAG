from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ResumeJobMatch(Base):
    __tablename__ = "resume_job_matches"
    __table_args__ = (
        Index("ix_resume_job_matches_resume_score", "resume_id", "score"),
        Index("ix_resume_job_matches_job_id", "job_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id = Column(String(255), nullable=False)
    score = Column(Float, nullable=False)
    matched_skills = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)
    reasons = Column(JSON, nullable=False, default=list)
    job_data = Column(JSON, nullable=True)
    computed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    resume = relationship("Resume")
