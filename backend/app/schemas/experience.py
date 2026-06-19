from pydantic import BaseModel, Field, field_validator, ConfigDict


class ExperienceCreate(BaseModel):
    company: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("company", "role", "description")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value
        return value.strip()


class ExperienceResponse(ExperienceCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
