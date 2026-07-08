from pydantic import BaseModel, Field, field_validator, ConfigDict


class ProjectCreate(BaseModel):
    title: str = Field(max_length=100)
    description: str = Field(max_length=1000)
    tech_stack: str | None = Field(default=None, max_length=255)
    github_url: str | None = None
    live_url: str | None = None

    @field_validator("title", "description", "tech_stack")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value
        return value.strip()


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    tech_stack: str | None = None
    github_url: str | None = None
    live_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
