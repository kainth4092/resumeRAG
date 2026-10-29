from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"
    __table_args__ = (
        Index("ix_roadmaps_user_id_generated_at", "user_id", "generated_at"),
        Index("ix_roadmaps_resume_id", "resume_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    resume_id = Column(
        Integer,
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=True,
    )
    job_context_id = Column(
        Integer,
        ForeignKey("job_contexts.id", ondelete="SET NULL"),
        nullable=True,
    )
    target_role = Column(
        String(150),
        nullable=False,
        default="Software Engineer",
    )
    target_level = Column(
        String(250),
        nullable=False,
        default="Junior",
    )
    plan = Column(JSON, nullable=True)
    completed_tasks = Column(JSON, nullable=False, default=list)
    generated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship("User")
    resume = relationship("Resume")
    job_context = relationship("JobContext")
