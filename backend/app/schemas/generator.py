from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=50)


class Heatmap(BaseModel):
    contact_info: int = 0
    summary: int = 0
    skills: int = 0
    experience: int = 0
    projects: int = 0
    education: int = 0


class AnalyzeResponse(BaseModel):
    ats_score: int = 0
    matched_keywords: list[str] = []
    missing_keywords: list[str] = []
    suggestions: list[str] = []
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
    description: list[str] = []


class Project(BaseModel):
    title: str = ""
    technologies: list[str] = []
    description: list[str] = []
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
    skills: list[str] = []
    experience: list[Experience] = []
    projects: list[Project] = []
    education: list[Education] = []


class GenerateRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=50)


class GenerateResponse(BaseModel):
    resume: GeneratedResume = Field(default_factory=GeneratedResume)
    resume_id: int | None = None



class AnalyzeHealthRequest(BaseModel):
    resume_id: int


class ImproveSectionRequest(BaseModel):
    resume_id: int
    section_name: str
    content: str = None

