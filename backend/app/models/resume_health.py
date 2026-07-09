from datetime import datetime
from sqlalchemy import ForeignKey, Text, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ResumeHealthAnalysis(Base):
    __tablename__ = "resume_health_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"), unique=True
    )

    ats_score: Mapped[int] = mapped_column(Integer, default=0)
    resume_health_score: Mapped[int] = mapped_column(Integer, default=0)
    formatting_score: Mapped[int] = mapped_column(Integer, default=0)
    readability_score: Mapped[int] = mapped_column(Integer, default=0)
    skills_coverage: Mapped[int] = mapped_column(Integer, default=0)
    experience_quality: Mapped[int] = mapped_column(Integer, default=0)
    projects_quality: Mapped[int] = mapped_column(Integer, default=0)
    education_quality: Mapped[int] = mapped_column(Integer, default=0)
    keyword_optimization: Mapped[int] = mapped_column(Integer, default=0)
    grammar_writing: Mapped[int] = mapped_column(Integer, default=0)
    section_completeness: Mapped[int] = mapped_column(Integer, default=0)
    recruiter_readiness: Mapped[int] = mapped_column(Integer, default=0)

    suggestions: Mapped[str] = mapped_column(Text, nullable=True)
    missing_sections: Mapped[str] = mapped_column(Text, nullable=True)
    strengths: Mapped[str] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[str] = mapped_column(Text, nullable=True)

    canonical_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scoring_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    analysis_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    jd_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume")

