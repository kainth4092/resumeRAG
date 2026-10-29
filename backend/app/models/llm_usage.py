from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LLMUsage(Base):
    __tablename__ = "llm_usage"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            "feature",
            name="uq_llm_usage_user_date_feature",
        ),
        Index("ix_llm_usage_user_id_date", "user_id", "date"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False, server_default=func.current_date())
    feature = Column(String(50), nullable=False, default="general")
    call_count = Column(Integer, nullable=False, default=1)
    tokens_used = Column(Integer, nullable=False, default=0)
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
