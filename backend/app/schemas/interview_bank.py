from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


def clean_required_text(
    value: str,
) -> str:
    cleaned = " ".join(
        value.split()
    )

    if not cleaned:
        raise ValueError(
            "This field cannot be empty."
        )

    return cleaned


def clean_optional_text(
    value: str | None,
) -> str | None:
    if value is None:
        return None

    cleaned = " ".join(
        value.split()
    )

    return cleaned or None


def clean_tags(
    values: list[str],
) -> list[str]:
    cleaned_tags = []
    seen = set()

    for value in values:
        cleaned = " ".join(
            value.split()
        )

        if not cleaned:
            continue

        normalized = cleaned.lower()

        if normalized in seen:
            continue

        seen.add(normalized)
        cleaned_tags.append(cleaned)

    return cleaned_tags


class InterviewQuestionCreate(BaseModel):
    question: str = Field(
        ...,
        min_length=10,
        max_length=2000,
    )
    answer: Optional[str] = Field(
        default=None,
        max_length=10000,
    )
    skill: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )
    category: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )
    experience_level: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )
    company: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    role: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    tags: list[str] = Field(
        default_factory=list,
        max_length=20,
    )

    @field_validator(
        "question",
        "skill",
        "category",
        "experience_level",
    )
    @classmethod
    def validate_required_fields(
        cls,
        value: str,
    ) -> str:
        return clean_required_text(
            value
        )

    @field_validator(
        "answer",
        "company",
        "role",
    )
    @classmethod
    def validate_optional_fields(
        cls,
        value: str | None,
    ) -> str | None:
        return clean_optional_text(
            value
        )

    @field_validator("tags")
    @classmethod
    def validate_tags(
        cls,
        values: list[str],
    ) -> list[str]:
        return clean_tags(values)


class InterviewQuestionUpdate(BaseModel):
    question: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=2000,
    )
    answer: Optional[str] = Field(
        default=None,
        max_length=10000,
    )
    skill: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    category: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=50,
    )
    experience_level: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=50,
    )
    company: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    role: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    tags: Optional[list[str]] = Field(
        default=None,
        max_length=20,
    )

    @field_validator(
        "question",
        "skill",
        "category",
        "experience_level",
    )
    @classmethod
    def validate_required_updates(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        return clean_required_text(
            value
        )

    @field_validator(
        "answer",
        "company",
        "role",
    )
    @classmethod
    def validate_optional_updates(
        cls,
        value: str | None,
    ) -> str | None:
        return clean_optional_text(
            value
        )

    @field_validator("tags")
    @classmethod
    def validate_update_tags(
        cls,
        values: list[str] | None,
    ) -> list[str] | None:
        if values is None:
            return None

        return clean_tags(values)

    @model_validator(mode="after")
    def validate_update_payload(
        self,
    ):
        if not self.model_fields_set:
            raise ValueError(
                "At least one field is required "
                "to update the question."
            )

        return self


class GenerateBankAnswerRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=10,
        max_length=2000,
    )
    skill: str = Field(
        default="",
        max_length=100,
    )
    category: str = Field(
        default="",
        max_length=50,
    )
    experience_level: str = Field(
        default="",
        max_length=50,
    )

    @field_validator("question")
    @classmethod
    def validate_question(
        cls,
        value: str,
    ) -> str:
        return clean_required_text(
            value
        )

    @field_validator(
        "skill",
        "category",
        "experience_level",
    )
    @classmethod
    def clean_context_fields(
        cls,
        value: str,
    ) -> str:
        return " ".join(
            value.split()
        )


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

    model_config = ConfigDict(
        from_attributes=True
    )


class InterviewQuestionListResponse(BaseModel):
    total: int
    questions: list[
        InterviewQuestionResponse
    ]
