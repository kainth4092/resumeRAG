from pydantic import BaseModel, Field, field_validator, ConfigDict


class SkillCreate(BaseModel):
    skill_name: str = Field(min_length=2, max_length=50)

    @field_validator("skill_name")
    @classmethod
    def validate_skill_name(cls, value):

        value = value.strip()

        if not value:
            raise ValueError("Skill name cannot be empty.")

        return value


class SkillResponse(BaseModel):
    id: int
    skill_name: str

    model_config = ConfigDict(from_attributes=True)
