from datetime import datetime
from typing import List, Optional, Any
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

class GenerateInterviewRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="Valid resume ID",
    )
    job_description: str = Field(
        ...,
        min_length=50,
        max_length=20000,
    )
    company: Optional[str] = Field(
        default=None,
        max_length=150,
    )
    role: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    @field_validator("job_description")
    @classmethod
    def validate_job_description(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        if len(cleaned) < 50:
            raise ValueError(
                "Job description is too short. "
                "Please enter at least 50 "
                "characters."
            )

        if len(cleaned.split()) < 10:
            raise ValueError(
                "Job description is too short. "
                "Please enter at least 10 "
                "meaningful words describing "
                "the role, responsibilities, "
                "or required skills."
            )

        return cleaned

    @field_validator(
        "company",
        "role",
    )
    @classmethod
    def clean_optional_fields(
        cls,
        value: Optional[str],
    ) -> Optional[str]:
        if value is None:
            return None

        cleaned = " ".join(
            value.split()
        )

        return cleaned or None


class ChallengeAnswerRequest(BaseModel):
    question_id: int = Field(
        ...,
        gt=0,
    )
    selected_option: str | None = None
    correct_option: str = Field(
        ...,
        min_length=1,
        max_length=1,
    )
    skill: str = Field(
        default="General",
        min_length=1,
        max_length=100,
    )

    @field_validator(
        "selected_option",
        "correct_option",
    )
    @classmethod
    def validate_option(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip().upper()

        if cleaned not in {
            "A",
            "B",
            "C",
            "D",
        }:
            raise ValueError(
                "Option must be A, B, C, or D."
            )

        return cleaned

    @field_validator("skill")
    @classmethod
    def clean_skill(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        return cleaned or "General"


class SubmitChallengeRequest(BaseModel):
    answers: list[
        ChallengeAnswerRequest
    ] = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    time_taken: int = Field(
        default=0,
        ge=0,
        le=86400,
    )

    @model_validator(mode="after")
    def validate_unique_questions(
        self,
    ):
        question_ids = [
            answer.question_id
            for answer in self.answers
        ]

        if len(question_ids) != len(
            set(question_ids)
        ):
            raise ValueError(
                "Each challenge question "
                "can be submitted only once."
            )

        return self


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
    is_personalized: bool = True
    source: str = "resume_generated"

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
    questions: List[
        InterviewQuestionResponse
    ] = Field(
        default_factory=list,
    )
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
