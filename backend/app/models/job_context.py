from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class JobContext(Base):
    __tablename__ = "job_contexts"

    jd_hash = Column(String(64), primary_key=True, index=True)
    keywords_json = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
