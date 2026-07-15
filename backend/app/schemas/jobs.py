from typing import Optional

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


class JobBase(BaseModel):
    job_id: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )
    company_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )
    job_title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )
    company_logo: Optional[str] = Field(
        default=None,
        max_length=2000,
    )
    location: Optional[str] = Field(
        default=None,
        max_length=255,
    )
    employment_type: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    apply_url: Optional[str] = Field(
        default=None,
        max_length=5000,
    )
    posted_at: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    @field_validator(
        "job_id",
        "company_name",
        "job_title",
    )
    @classmethod
    def clean_required_text(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        if not cleaned:
            raise ValueError(
                "Value cannot be empty."
            )

        return cleaned

    @field_validator(
        "company_logo",
        "location",
        "employment_type",
        "apply_url",
        "posted_at",
    )
    @classmethod
    def clean_optional_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None


class JobResponse(JobBase):
    description: Optional[str] = None
    salary: Optional[str] = None
    company_website: Optional[str] = None
    publisher: Optional[str] = None
