from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.sql import func
from app.core.database import Base


class JobContext(Base):
    __tablename__ = "job_contexts"
    __table_args__ = (
        Index("ix_job_contexts_description_hash", "description_hash"),
        Index("ix_job_contexts_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    raw_description = Column(Text, nullable=False)
    description_hash = Column(String(64), nullable=False)
    title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    seniority = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    required_skills = Column(JSON, nullable=True)
    preferred_skills = Column(JSON, nullable=True)
    keywords = Column(JSON, nullable=True)
    responsibilities = Column(JSON, nullable=True)
    source_job_id = Column(String(255), nullable=True)
    source_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
