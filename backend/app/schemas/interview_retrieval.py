from pydantic import BaseModel, field_validator


class InterviewRetrievalRequest(BaseModel):
    resume_id: int
    job_description: str

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, value: str):
        value = value.strip()
        if len(value) < 20:
            raise ValueError("Job description is too short.")
        return value
