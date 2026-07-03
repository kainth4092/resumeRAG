import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SearchCache(Base):
    __tablename__ = "search_cache"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    query = Column(String, unique=True, index=True, nullable=False)
    jobs_json = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class JobCache(Base):
    __tablename__ = "job_cache"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    job_id = Column(String, unique=True, index=True, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
