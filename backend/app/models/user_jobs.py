import uuid
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.core.database import Base


class UserJob(Base):
    __tablename__ = "user_jobs"
    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_user_jobs_user_id_job_id"),
        Index("ix_user_jobs_user_id_created_at", "user_id", "created_at"),
    )

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id = Column(String, nullable=False, index=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    company_logo = Column(String)
    location = Column(String)
    employment_type = Column(String)
    apply_url = Column(Text)
    posted_at = Column(String)
    status = Column(String, default="Viewed")
    viewed_at = Column(DateTime(timezone=True))
    applied_at = Column(DateTime(timezone=True))
    interview_date = Column(DateTime(timezone=True))
    source = Column(String, default="JSearch")
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )
