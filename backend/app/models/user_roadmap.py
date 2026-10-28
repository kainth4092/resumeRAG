from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class UserRoadmap(Base):
    __tablename__ = "user_roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )
    target_role: Mapped[str] = mapped_column(
        String(150), default="Frontend Developer"
    )
    target_level: Mapped[str] = mapped_column(
        String(250), default="Mid"
    )
    completed_tasks: Mapped[list] = mapped_column(JSON, default=list)

    user = relationship("User", back_populates="roadmap")
