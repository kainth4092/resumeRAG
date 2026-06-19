from sqlalchemy import String, ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSkill(Base):
    __tablename__ = "user_skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill_name: Mapped[str] = mapped_column(String(100))
    user = relationship("User", back_populates="skills")
