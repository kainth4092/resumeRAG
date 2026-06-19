from pydantic import BaseModel, Field, field_validator, ConfigDict, HttpUrl


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=500)
    tech_stack: str | None = Field(default=None, max_length=30)
    github_url: HttpUrl | None = None
    live_url: HttpUrl | None = None

    @field_validator("title", "description", "tech_stack")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value
        return value.strip()


class ProjectResponse(ProjectCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
