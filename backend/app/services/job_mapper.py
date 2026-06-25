from app.schemas.jobs import JobResponse


def map_job(job: dict) -> JobResponse:
    return JobResponse(
        job_id=job.get("job_id") or "",
        company_name=job.get("employer_name") or "",
        job_title=job.get("job_title") or "",
        company_logo=job.get("employer_logo"),
        location=job.get("job_location"),
        employment_type=job.get("job_employment_type"),
        apply_url=job.get("job_apply_link"),
        posted_at=job.get("job_posted_at"),
        description=job.get("job_description"),
        salary=job.get("job_salary_string"),
        company_website=job.get("employer_website"),
        publisher=job.get("job_publisher"),
    )
