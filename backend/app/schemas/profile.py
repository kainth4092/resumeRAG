from pydantic import BaseModel, Field, field_validator, ConfigDict


class ProfileCreate(BaseModel):
    full_name: str | None = Field(default=None, max_length=150)
    headline: str | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=150)
    linkedin_url: str | None = Field(default=None, max_length=255)
    github_url: str | None = Field(default=None, max_length=255)
    portfolio_url: str | None = Field(default=None, max_length=255)
    summary: str | None = Field(default=None, max_length=1000)

    @field_validator(
        "full_name",
        "headline",
        "phone",
        "location",
        "linkedin_url",
        "github_url",
        "portfolio_url",
        "summary",
    )
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return value
        return value.strip()


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
