import logging
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import JobNotFoundException
from app.jobs.services.job_mapper import map_job
from app.jobs.repository.jobs_repository import JobsRepository
from app.schemas.jobs import JobResponse

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
                return [JobResponse(**job) if isinstance(job, dict) else job for job in cached_search.jobs_json]
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

        try:
            serialized_jobs = [job.model_dump() if hasattr(job, "model_dump") else job for job in mapped_jobs]
            JobsRepository.add_search_cache(db, query_key, serialized_jobs)
        except Exception as e:
            logger.error("Error writing search_cache: %s", str(e), exc_info=True)

        return mapped_jobs

    @staticmethod
    async def get_job(db: Session, job_id: str):
        try:
            cached_job = JobsRepository.get_cached_job(db, job_id)
            if cached_job:
                return JobResponse(**cached_job.data) if isinstance(cached_job.data, dict) else cached_job.data
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
            serialized_job = mapped_job.model_dump() if hasattr(mapped_job, "model_dump") else mapped_job
            JobsRepository.add_job_cache(db, job_id, serialized_job)
        except Exception as e:
            logger.error("Error writing job_cache: %s", str(e), exc_info=True)

        return mapped_job
