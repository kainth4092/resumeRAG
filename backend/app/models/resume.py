from datetime import datetime
from sqlalchemy import ForeignKey, String, Text, DateTime, Boolean, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship, deferred
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"
    __table_args__ = (
        Index("ix_resumes_user_id_created_at", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_content_base64: Mapped[str | None] = deferred(mapped_column(Text, nullable=True))
    parsed_text: Mapped[str] = deferred(mapped_column(Text))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    starred: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ats_score: Mapped[int] = mapped_column(Integer, nullable=True, default=75)
    skills: Mapped[str] = mapped_column(Text, nullable=True)
    analysis_results: Mapped[str] = mapped_column(Text, nullable=True)
    version: Mapped[str] = mapped_column(String(50), nullable=True, default="v1")
    template: Mapped[str] = mapped_column(
        String(100), nullable=True, default="Professional"
    )
    is_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str] = mapped_column(String(50), default="upload")
    parent_resume_id: Mapped[int | None] = mapped_column(
        ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )
    job_context_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_contexts.id", ondelete="SET NULL"), nullable=True
    )
    resume_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsing_status: Mapped[str | None] = mapped_column(String(50), nullable=True, default="pending")
    parse_warnings: Mapped[str | None] = mapped_column(Text, nullable=True)
    canonical_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scoring_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    jd_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user = relationship("User", back_populates="resumes")
    parent_resume = relationship(
        "Resume", remote_side=[id], foreign_keys=[parent_resume_id]
    )
    job_context = relationship("JobContext")
