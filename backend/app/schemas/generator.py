from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=50)


class Heatmap(BaseModel):
    contact_info: int
    summary: int
    skills: int
    experience: int
    projects: int
    education: int


class AnalyzeResponse(BaseModel):
    ats_score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    suggestions: list[str]
    heatmap: Heatmap


# ---------------------------------------------


class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    linkedin: str
    github: str


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    description: list[str]


class Project(BaseModel):
    title: str
    technologies: list[str]
    description: list[str]
    github: str
    live: str


class Education(BaseModel):
    institution: str
    degree: str
    start_year: str
    end_year: str


class GeneratedResume(BaseModel):
    personal_info: PersonalInfo
    headline: str
    summary: str
    skills: list[str]
    experience: list[Experience]
    projects: list[Project]
    education: list[Education]


class GenerateRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=50)


class GenerateResponse(BaseModel):
    resume: GeneratedResume
