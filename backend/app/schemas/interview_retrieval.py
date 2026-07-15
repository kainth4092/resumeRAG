from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


class InterviewRetrievalRequest(BaseModel):
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

    @field_validator(
        "job_description"
    )
    @classmethod
    def validate_job_description(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        if len(
            cleaned.split()
        ) < 10:
            raise ValueError(
                "Job description is too short. "
                "Please enter at least 10 "
                "meaningful words including "
                "the role, responsibilities, "
                "or required skills."
            )

        return cleaned
