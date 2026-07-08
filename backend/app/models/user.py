from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.resume import Resume
    from app.models.user_skill import UserSkill
    from app.models.user_project import UserProject
    from app.models.user_education import UserEducation
    from app.models.user_experience import UserExperience
    from app.models.user_roadmap import UserRoadmap


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )
    password_hash: Mapped[str | None] = mapped_column(String(100), nullable=True)
    provider: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default="local"
    )
    provider_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    skills: Mapped[list["UserSkill"]] = relationship(
        "UserSkill", back_populates="user", cascade="all, delete-orphan"
    )
    projects: Mapped[list["UserProject"]] = relationship(
        "UserProject", back_populates="user", cascade="all, delete-orphan"
    )
    education: Mapped[list["UserEducation"]] = relationship(
        "UserEducation", back_populates="user", cascade="all, delete-orphan"
    )
    experiences: Mapped[list["UserExperience"]] = relationship(
        "UserExperience", back_populates="user", cascade="all, delete-orphan"
    )
    resumes: Mapped[list["Resume"]] = relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )
    roadmap: Mapped["UserRoadmap"] = relationship(
        "UserRoadmap",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
