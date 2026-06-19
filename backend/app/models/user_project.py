from sqlalchemy import String, ForeignKey, Text

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserProject(Base):
    __tablename__ = "user_projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    tech_stack: Mapped[str | None] = mapped_column(Text, nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    live_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    user = relationship("User", back_populates="projects")
