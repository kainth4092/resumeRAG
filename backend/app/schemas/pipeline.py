from typing import Literal, Any
from pydantic import BaseModel, Field


class JobContextExtraction(BaseModel):
    title: str | None = Field(default=None, description="Job title, e.g. Senior Backend Engineer")
    company: str | None = Field(default=None, description="Hiring company name")
    seniority: str | None = Field(default="Mid", description="Seniority level, e.g. Entry, Junior, Mid, Senior, Lead")
    location: str | None = Field(default=None, description="Location, e.g. Remote or San Francisco, CA")
    required_skills: list[str] = Field(default_factory=list, description="Must-have technical and domain skills")
    preferred_skills: list[str] = Field(default_factory=list, description="Nice-to-have or preferred skills")
    keywords: list[str] = Field(default_factory=list, description="Key industry buzzwords, methodologies, tools")
    responsibilities: list[str] = Field(default_factory=list, description="Key job responsibilities")


class PipelineSource(BaseModel):
    type: Literal["resume", "profile"] = "resume"
    resume_id: int | None = None


class PipelineRunRequest(BaseModel):
    job_description: str = Field(..., min_length=50, max_length=20000)
    job_id: str | None = None
    company: str | None = None
    role: str | None = None
    source: PipelineSource = Field(default_factory=PipelineSource)
    template: str = "Professional"


class PipelineRunResponse(BaseModel):
    run_id: str
    status: str
    is_existing: bool = False
    message: str = "Pipeline run queued successfully"


class PipelineStepInfo(BaseModel):
    name: str
    status: Literal["pending", "running", "completed", "failed", "skipped"]
    started_at: str | None = None
    finished_at: str | None = None
    error: str | None = None


class PipelineRunDetail(BaseModel):
    id: str
    user_id: int
    source_resume_id: int | None = None
    generated_resume_id: int | None = None
    job_context_id: int | None = None
    template: str = "Professional"
    status: Literal["queued", "running", "completed", "partial", "failed"]
    steps: list[dict[str, Any]] = Field(default_factory=list)
    created_at: str
    updated_at: str | None = None
    artifacts: dict[str, Any] | None = None
