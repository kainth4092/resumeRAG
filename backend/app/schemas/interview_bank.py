from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class InterviewQuestionCreate(BaseModel):
    question: str
    answer: Optional[str] = None

    skill: str
    category: str
    experience_level: str

    company: Optional[str] = None
    role: Optional[str] = None

    tags: list[str] = []

    @field_validator(
        "question",
        "skill",
        "category",
        "experience_level",
    )
    @classmethod
    def validate_required_fields(cls, value: str):
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("company", "role")
    @classmethod
    def clean_optional_fields(cls, value):
        if value:
            return value.strip()
        return value


class InterviewQuestionUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None

    skill: Optional[str] = None
    category: Optional[str] = None
    experience_level: Optional[str] = None

    company: Optional[str] = None
    role: Optional[str] = None

    tags: Optional[list[str]] = None


class InterviewQuestionResponse(BaseModel):
    id: int

    question: str
    answer: str

    skill: str
    category: str
    experience_level: str

    company: Optional[str]
    role: Optional[str]

    tags: list[str]

    source: str
    is_personalized: bool = False

    created_by: Optional[int]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewQuestionListResponse(BaseModel):
    total: int
    questions: list[InterviewQuestionResponse]
