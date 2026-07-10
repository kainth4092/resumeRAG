from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    email_notifications = Column(Boolean, default=True, nullable=False)
    weekly_digest = Column(Boolean, default=True, nullable=False)
    job_alerts = Column(Boolean, default=True, nullable=False)
    interview_alerts = Column(Boolean, default=True, nullable=False)
    roadmap_updates = Column(Boolean, default=True, nullable=False)
    product_updates = Column(Boolean, default=False, nullable=False)

    share_analytics = Column(Boolean, default=True, nullable=False)
    personalize_jobs = Column(Boolean, default=True, nullable=False)
