from pydantic import BaseModel, Field, field_validator, ConfigDict, model_validator


class ExperienceBase(BaseModel):
    company: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    start_month: str | None = None
    start_year: int | None = None
    end_month: str | None = None
    end_year: int | None = None
    currently_working: bool = False

    @field_validator("company", "role", "description")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value
        return value.strip()


class ExperienceCreate(ExperienceBase):

    @model_validator(mode="after")
    def validate_dates(self):
        if not self.currently_working:
            if self.end_month is None or self.end_year is None:
                raise ValueError(
                    "End month and end year are required when currently working is false."
                )
        return self


class ExperienceResponse(ExperienceBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
