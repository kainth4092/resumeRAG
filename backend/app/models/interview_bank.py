from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.sql import func
from app.core.database import Base


class InterviewQuestionBank(Base):
    __tablename__ = "interview_question_bank"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    skill = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)

    experience_level = Column(String(50), nullable=False)

    company = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)

    tags = Column(JSON, nullable=False, default=list)

    # MCQ columns
    option_a = Column(Text, nullable=True)
    option_b = Column(Text, nullable=True)
    option_c = Column(Text, nullable=True)
    option_d = Column(Text, nullable=True)
    correct_option = Column(String(10), nullable=True)
    short_explanation = Column(Text, nullable=True)
    distractor_explanations = Column(JSON, nullable=True)

    source = Column(
        String(20),
        nullable=False,
        default="AI",
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
