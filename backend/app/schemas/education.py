from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime

CURRENT_YEAR = datetime.now().year


class EducationCreate(BaseModel):
    institution: str = Field(min_length=2, max_length=150)
    degree: str = Field(min_length=2, max_length=80)
    start_year: int | None = None
    end_year: int | None = None

    @field_validator("institution", "degree")
    @classmethod
    def clean_text(cls, value):
        return value.strip()

    @field_validator("start_year", "end_year")
    @classmethod
    def validate_year(cls, value):
        if value is None:
            return value
        if value < 1950 or value > CURRENT_YEAR + 10:
            raise ValueError("Invalid year.")
        return value


class EducationResponse(BaseModel):
    id: int
    institution: str
    degree: str
    start_year: int | None = None
    end_year: int | None = None

    model_config = ConfigDict(from_attributes=True)
