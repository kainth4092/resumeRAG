import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    JSON,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "source_resume_id",
            "description_hash",
            "template",
            name="uq_pipeline_runs_idempotency",
        ),
        Index("ix_pipeline_runs_user_id_created_at", "user_id", "created_at"),
    )

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
    )
    generated_resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
    )
    job_context_id = Column(
        Integer,
        ForeignKey("job_contexts.id", ondelete="SET NULL"),
        nullable=True,
    )
    description_hash = Column(String(64), nullable=False, index=True)
    template = Column(String(50), nullable=False, default="Professional")
    status = Column(
        String(50),
        nullable=False,
        default="queued",
    )  # 'queued' | 'running' | 'completed' | 'partial' | 'failed'
    steps = Column(JSON, nullable=False, default=list)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User")
    source_resume = relationship("Resume", foreign_keys=[source_resume_id])
    generated_resume = relationship("Resume", foreign_keys=[generated_resume_id])
    job_context = relationship("JobContext", foreign_keys=[job_context_id])
