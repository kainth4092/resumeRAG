from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator


class GenerateInterviewRequest(BaseModel):
    resume_id: int
    job_description: str
    company: Optional[str] = None
    role: Optional[str] = None

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, value: str):
        value = value.strip()
        if len(value) < 30:
            raise ValueError("Job description is too short.")
        return value

    @field_validator("company", "role")
    @classmethod
    def clean_optional_fields(cls, value):
        if value:
            return value.strip()
        return value


class InterviewQuestionResponse(BaseModel):
    id: int
    category: str
    question: str
    difficulty: str
    estimated_duration: Optional[str] = None
    tech_skill: Optional[str] = None
    answer: Optional[Any] = None
    details_generated: bool
    bookmarked: bool

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str):
        allowed = {"Easy", "Medium", "Hard"}
        if value not in allowed:
            return "Medium"
        return value

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value: str):
        categories = {
            "technical": "Technical",
            "project": "Project",
            "experience": "Experience",
        }
        return categories.get(value.lower(), value.title())

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionResponse(BaseModel):

    id: int
    resume_id: int
    company: Optional[str] = None
    role: Optional[str] = None
    candidate_type: str
    job_description: str
    created_at: datetime
    resume_title: Optional[str] = None
    questions: List[InterviewQuestionResponse] = []
    model_config = ConfigDict(from_attributes=True)


class GenerateInterviewResponse(BaseModel):
    session: InterviewSessionResponse


class InterviewHistoryItem(BaseModel):

    id: int
    company: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime
    questions_count: int
    model_config = ConfigDict(from_attributes=True)
