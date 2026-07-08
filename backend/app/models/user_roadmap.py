from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class UserRoadmap(Base):
    __tablename__ = "user_roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )
    target_role: Mapped[str] = mapped_column(
        String(150), default="Senior Frontend Engineer"
    )
    target_level: Mapped[str] = mapped_column(
        String(250), default="At top-tier startups (Stripe, Linear, Vercel level)"
    )
    completed_tasks: Mapped[str | None] = mapped_column(Text, default="[]")

    user = relationship("User", back_populates="roadmap")
