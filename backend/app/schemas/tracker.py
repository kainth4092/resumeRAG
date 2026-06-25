from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.jobs import JobBase


class JobStatus(str, Enum):
    viewed = "Viewed"
    saved = "Saved"
    applied = "Applied"
    interview = "Interview"
    offer = "Offer"
    rejected = "Rejected"
    wishlist = "Wishlist"
    assessment = "Assessment"
    hr_round = "HR Round"
    technical = "Technical"


class SaveJobRequest(JobBase):
    pass


class UpdateJobStatusRequest(BaseModel):
    status: JobStatus


class TrackedJobResponse(BaseModel):
    id: str
    user_id: int
    job_id: str
    company_name: str
    job_title: str
    company_logo: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    apply_url: Optional[str] = None
    posted_at: Optional[str] = None
    status: JobStatus
    viewed_at: Optional[datetime] = None
    applied_at: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    source: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
