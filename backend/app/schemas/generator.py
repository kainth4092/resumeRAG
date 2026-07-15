from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


class AnalyzeRequest(BaseModel):
    resume_id: int = Field(..., gt=0, description="Valid resume ID")

    job_description: str = Field(
        ...,
        min_length=50,
        max_length=20000,
        description="Job description used for ATS analysis",
    )

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, value: str) -> str:
        cleaned = " ".join(value.split())

        if not cleaned:
            raise ValueError(
                "Job description is required. Please paste the complete job description."
            )

        words = cleaned.split()

        if len(words) < 10:
            raise ValueError(
                "Job description is too short. Please enter at least 10 meaningful words including the role, responsibilities, or required skills."
            )

        return cleaned


class Heatmap(BaseModel):
    contact_info: int = 0
    summary: int = 0
    skills: int = 0
    experience: int = 0
    projects: int = 0
    education: int = 0


class AnalyzeResponse(BaseModel):
    ats_score: int = 0
    matched_keywords: list[str] = Field(
        default_factory=list,
    )
    missing_keywords: list[str] = Field(
        default_factory=list,
    )
    suggestions: list[str] = Field(
        default_factory=list,
    )
    heatmap: Heatmap = Field(default_factory=Heatmap)


# ---------------------------------------------


class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""


class Experience(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    description: list[str] = Field(
        default_factory=list,
    )


class Project(BaseModel):
    title: str = ""
    technologies: list[str] = Field(
        default_factory=list,
    )
    description: list[str] = Field(
        default_factory=list,
    )
    github: str = ""
    live: str = ""


class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    start_year: str = ""
    end_year: str = ""


class GeneratedResume(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    headline: str = ""
    summary: str = ""
    skills: list[str] = Field(
        default_factory=list,
    )
    experience: list[Experience] = Field(
        default_factory=list,
    )
    projects: list[Project] = Field(
        default_factory=list,
    )
    education: list[Education] = Field(
        default_factory=list,
    )


class GenerateRequest(BaseModel):
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

    @field_validator("job_description")
    @classmethod
    def validate_job_description(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        if len(cleaned.split()) < 10:
            raise ValueError(
                "Job description is too short. "
                "Please enter at least 10 "
                "meaningful words."
            )

        return cleaned


class GenerateResponse(BaseModel):
    resume: GeneratedResume = Field(
        default_factory=GeneratedResume,
    )
    resume_id: int | None = None


class AnalyzeHealthRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="Valid resume ID",
    )


class ImproveSectionRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="Valid resume ID",
    )
    section_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )
    content: str | None = Field(
        default=None,
        max_length=10000,
    )

    @field_validator("section_name")
    @classmethod
    def validate_section_name(
        cls,
        value: str,
    ) -> str:
        cleaned = " ".join(
            value.split()
        )

        if not cleaned:
            raise ValueError(
                "Section name is required."
            )

        return cleaned

    @field_validator("content")
    @classmethod
    def clean_content(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None
