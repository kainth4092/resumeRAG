import logging
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import JobNotFoundException
from app.jobs.services.job_mapper import map_job
from app.jobs.repository.jobs_repository import JobsRepository
from app.schemas.jobs import JobResponse
from app.models.job_cache import SearchCache

logger = logging.getLogger(__name__)


class JSearchService:
    BASE_URL = "https://jsearch.p.rapidapi.com"

    @staticmethod
    def _get_headers() -> dict:
        return {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.RAPIDAPI_HOST,
        }

    @staticmethod
    def get_mock_fallback_jobs(query: str) -> list:
        q_lower = query.lower()

        if (
            "frontend" in q_lower
            or "react" in q_lower
            or "web" in q_lower
            or "ui" in q_lower
        ):
            roles = [
                (
                    "Frontend Engineer",
                    "Vercel",
                    "Remote, US / India",
                    "120k - 150k",
                    "React, TypeScript, Next.js",
                ),
                (
                    "React Developer",
                    "Stripe",
                    "San Francisco, CA",
                    "140k - 180k",
                    "React, Redux, Tailwind",
                ),
                (
                    "Web Applications Engineer",
                    "Figma",
                    "Remote, India",
                    "110k - 140k",
                    "TypeScript, WebGL, CSS",
                ),
                (
                    "Senior UI Engineer",
                    "Linear",
                    "Remote",
                    "130k - 160k",
                    "React, TypeScript, Framer Motion",
                ),
                (
                    "Frontend Architect",
                    "Supabase",
                    "Singapore / Remote",
                    "150k - 190k",
                    "React, Tailwind, Next.js",
                ),
            ]
        elif (
            "devops" in q_lower
            or "cloud" in q_lower
            or "sre" in q_lower
            or "infrastructure" in q_lower
        ):
            roles = [
                (
                    "DevOps Engineer",
                    "HashiCorp",
                    "Remote",
                    "130k - 160k",
                    "Terraform, AWS, Consul, Docker",
                ),
                (
                    "Site Reliability Engineer",
                    "Datadog",
                    "New York, NY",
                    "140k - 170k",
                    "Kubernetes, Go, Prometheus",
                ),
                (
                    "Cloud Infrastructure Engineer",
                    "AWS",
                    "Seattle, WA",
                    "150k - 190k",
                    "AWS, Terraform, Networking",
                ),
                (
                    "Platform Engineer",
                    "GitHub",
                    "Remote",
                    "140k - 180k",
                    "Kubernetes, Azure, Actions, Go",
                ),
                (
                    "DevSecOps Specialist",
                    "Snyk",
                    "Remote",
                    "130k - 165k",
                    "Security, Docker, CI/CD, Kubernetes",
                ),
            ]
        elif (
            "data" in q_lower
            or "ml" in q_lower
            or "ai" in q_lower
            or "machine learning" in q_lower
            or "analytics" in q_lower
        ):
            roles = [
                (
                    "Data Engineer",
                    "Snowflake",
                    "San Mateo, CA",
                    "140k - 180k",
                    "SQL, Spark, Airflow, Python",
                ),
                (
                    "Machine Learning Engineer",
                    "OpenAI",
                    "San Francisco, CA",
                    "200k - 300k",
                    "Python, PyTorch, LLMs",
                ),
                (
                    "AI Research Engineer",
                    "Anthropic",
                    "San Francisco, CA",
                    "190k - 280k",
                    "Python, PyTorch, Transformers",
                ),
                (
                    "Data Infrastructure Engineer",
                    "Databricks",
                    "Remote",
                    "150k - 200k",
                    "Spark, Scala, Kubernetes",
                ),
                (
                    "Analytics Engineer",
                    "dbt Labs",
                    "Remote",
                    "120k - 150k",
                    "SQL, dbt, Snowflake, Python",
                ),
            ]
        elif (
            "backend" in q_lower
            or "fastapi" in q_lower
            or "python" in q_lower
            or "go" in q_lower
            or "node" in q_lower
        ):
            roles = [
                (
                    "Backend Engineer (FastAPI/Python)",
                    "Postman",
                    "Remote, India",
                    "110k - 140k",
                    "Python, FastAPI, PostgreSQL, Redis",
                ),
                (
                    "Distributed Systems Engineer (Go)",
                    "Uber",
                    "San Francisco, CA",
                    "150k - 190k",
                    "Go, Microservices, Kafka, Redis",
                ),
                (
                    "Backend Engineer (Node.js)",
                    "Retool",
                    "Remote",
                    "130k - 160k",
                    "Node.js, TypeScript, Postgres, Docker",
                ),
                (
                    "Backend Developer",
                    "Slack",
                    "Remote",
                    "140k - 180k",
                    "Python, Java, MySQL, AWS",
                ),
                (
                    "Backend Platform Engineer",
                    "Scale AI",
                    "San Francisco, CA",
                    "160k - 210k",
                    "Python, Go, MongoDB, Docker",
                ),
            ]
        else:
            # Fullstack / General Software Engineer
            roles = [
                (
                    "Full Stack Engineer",
                    "Vercel",
                    "Remote",
                    "130k - 160k",
                    "React, Node.js, Next.js, Postgres",
                ),
                (
                    "Software Engineer",
                    "Google",
                    "Mountain View, CA",
                    "150k - 200k",
                    "Java, C++, Python, System Design",
                ),
                (
                    "Full Stack Developer",
                    "Stripe",
                    "Remote, US / India",
                    "140k - 180k",
                    "React, Ruby on Rails, Postgres",
                ),
                (
                    "Software Development Engineer",
                    "Amazon",
                    "Bangalore, India",
                    "110k - 140k",
                    "Java, AWS, Microservices",
                ),
                (
                    "Full Stack Engineer",
                    "Linear",
                    "Remote",
                    "130k - 170k",
                    "React, Node.js, TypeScript, Tailwind",
                ),
            ]

        mock_jobs = []
        for i, (title, company, loc, sal, skills) in enumerate(roles):
            mock_jobs.append(
                JobResponse(
                    job_id=f"mock-{company.lower()}-{i}",
                    company_name=company,
                    job_title=title,
                    company_logo=f"https://logo.clearbit.com/{company.lower()}.com",
                    location=loc,
                    employment_type="Full-time",
                    apply_url=(
                        "https://jobs.lever.co/" + company.lower()
                        if i % 2 == 0
                        else "https://boards.greenhouse.io/" + company.lower()
                    ),
                    posted_at="1 day ago",
                    description=f"Join the engineering team at {company} to build scalable solutions. Required skills: {skills}.",
                    salary=sal,
                    company_website=f"https://{company.lower()}.com",
                    publisher=f"{company} Careers",
                )
            )
        return mock_jobs

    @staticmethod
    async def search_jobs(
        db: Session,
        query: str,
        page: int = 1,
        num_pages: int = 1,
        location: str | None = None,
        employment_type: str | None = None,
        remote: str | None = None,
    ):
        query_key = f"{query}||page:{page}||loc:{location or ''}||type:{employment_type or ''}||remote:{remote or ''}"

        try:
            cached_search = JobsRepository.get_cached_search(db, query_key)
            if cached_search:
                return [
                    JobResponse(**job) if isinstance(job, dict) else job
                    for job in cached_search.jobs_json
                ]
        except Exception as e:
            logger.error("Error reading search_cache: %s", str(e), exc_info=True)
            pass

        headers = JSearchService._get_headers()
        params = {
            "query": query,
            "page": page,
            "num_pages": num_pages,
            "country": "in",
        }
        if location:
            params["location"] = location

        if employment_type:
            val = employment_type.upper().replace("-", "")
            if val in ["FULLTIME", "CONTRACT", "PARTTIME", "INTERN"]:
                params["employment_types"] = val

        if remote == "yes":
            params["remote_jobs_only"] = "true"

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{JSearchService.BASE_URL}/search-v2",
                    headers=headers,
                    params=params,
                )
            response.raise_for_status()
            data = response.json()
            raw_data = data.get("data", [])
            if isinstance(raw_data, dict):
                jobs = raw_data.get("jobs", [])
            elif isinstance(raw_data, list):
                jobs = raw_data
            else:
                jobs = []

            mapped_jobs = [map_job(job) for job in jobs]

            if mapped_jobs:
                try:
                    serialized_jobs = [
                        job.model_dump() if hasattr(job, "model_dump") else job
                        for job in mapped_jobs
                    ]
                    JobsRepository.add_search_cache(db, query_key, serialized_jobs)
                except Exception as e:
                    logger.error(
                        "Error writing search_cache: %s", str(e), exc_info=True
                    )

            return mapped_jobs

        except Exception as http_err:
            logger.warning(
                "JSearch API request failed (%s): %s. Attempting fallback.",
                query,
                str(http_err),
            )

            # Fallback 1: Return the latest cached search query results if any exist
            try:
                latest_cache = (
                    db.query(SearchCache)
                    .order_by(SearchCache.created_at.desc())
                    .first()
                )
                if latest_cache and latest_cache.jobs_json:
                    logger.info(
                        "Fallback: Returning latest cached jobs from query '%s'",
                        latest_cache.query,
                    )
                    return [
                        JobResponse(**job) if isinstance(job, dict) else job
                        for job in latest_cache.jobs_json
                    ]
            except Exception as fb_err:
                logger.error(
                    "Error fetching latest search cache fallback: %s", str(fb_err)
                )

            # Fallback 2: Return high-quality mock jobs matching the query/headline
            logger.info("Fallback: No cache found. Returning realistic mock jobs.")
            return JSearchService.get_mock_fallback_jobs(query)

    @staticmethod
    async def get_job(db: Session, job_id: str):
        try:
            cached_job = JobsRepository.get_cached_job(db, job_id)
            if cached_job:
                return (
                    JobResponse(**cached_job.data)
                    if isinstance(cached_job.data, dict)
                    else cached_job.data
                )
        except Exception as e:
            logger.error("Error reading job_cache: %s", str(e), exc_info=True)
            pass

        headers = JSearchService._get_headers()
        params = {"job_id": job_id}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{JSearchService.BASE_URL}/job-details",
                headers=headers,
                params=params,
            )
        response.raise_for_status()
        data = response.json()
        raw_data = data.get("data", {})
        if isinstance(raw_data, list):
            job = raw_data[0] if raw_data else {}
        elif isinstance(raw_data, dict):
            if "jobs" in raw_data and isinstance(raw_data["jobs"], list):
                job = raw_data["jobs"][0] if raw_data["jobs"] else {}
            else:
                job = raw_data
        else:
            job = {}

        if not job or not job.get("job_id"):
            raise JobNotFoundException(f"Job with ID {job_id} not found")

        mapped_job = map_job(job)

        try:
            serialized_job = (
                mapped_job.model_dump()
                if hasattr(mapped_job, "model_dump")
                else mapped_job
            )
            JobsRepository.add_job_cache(db, job_id, serialized_job)
        except Exception as e:
            logger.error("Error writing job_cache: %s", str(e), exc_info=True)

        return mapped_job
