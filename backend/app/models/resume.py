from datetime import datetime
from sqlalchemy import ForeignKey, String, Text, DateTime, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    original_filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_content_base64: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_text: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ats_score: Mapped[int] = mapped_column(Integer, nullable=True, default=75)
    skills: Mapped[str] = mapped_column(Text, nullable=True)
    analysis_results: Mapped[str] = mapped_column(Text, nullable=True)
    version: Mapped[str] = mapped_column(String(50), nullable=True, default="v1")
    template: Mapped[str] = mapped_column(
        String(100), nullable=True, default="Professional"
    )
    is_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    resume_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsing_status: Mapped[str | None] = mapped_column(String(50), nullable=True, default="pending")
    canonical_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scoring_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    jd_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user = relationship("User", back_populates="resumes")
