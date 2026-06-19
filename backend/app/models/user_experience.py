from sqlalchemy import String, ForeignKey, Text

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserExperience(Base):
    __tablename__ = "user_experience"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    company: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    user = relationship("User", back_populates="experiences")
