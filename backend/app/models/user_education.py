from sqlalchemy import String, ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserEducation(Base):
    __tablename__ = "user_education"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    institution: Mapped[str] = mapped_column(String(255))
    degree: Mapped[str] = mapped_column(String(100))
    start_year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    end_year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    user = relationship("User", back_populates="education")
