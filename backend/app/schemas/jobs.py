from pydantic import BaseModel
from typing import Optional


class JobBase(BaseModel):
    job_id: str
    company_name: str
    job_title: str
    company_logo: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    apply_url: Optional[str] = None
    posted_at: Optional[str] = None


class JobResponse(JobBase):
    description: Optional[str] = None
    salary: Optional[str] = None
    company_website: Optional[str] = None
    publisher: Optional[str] = None
