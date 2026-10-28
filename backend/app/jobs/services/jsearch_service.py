import logging
import time
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import JobNotFoundException, JobsProviderError
from app.jobs.services.job_mapper import map_job
from app.jobs.repository.jobs_repository import JobsRepository
from app.schemas.jobs import JobResponse

logger = logging.getLogger(__name__)


def _is_expired(job: dict) -> bool:
    exp_str = job.get("job_offer_expiration_datetime_utc")
    if exp_str:
        try:
            exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
            if exp_dt < datetime.now(timezone.utc):
                return True
        except Exception:
            pass
    exp_ts = job.get("job_offer_expiration_timestamp")
    if exp_ts:
        try:
            if float(exp_ts) < time.time():
                return True
        except Exception:
            pass
    return False


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
        date_posted: str | None = None,
        country: str | None = None,
    ) -> list[JobResponse]:
        selected_country = country or "us"
        query_key = (
            f"{query}||page:{page}||loc:{location or ''}||type:{employment_type or ''}"
            f"||remote:{remote or ''}||date:{date_posted or ''}||country:{selected_country}"
        )

        try:
            cached_search = JobsRepository.get_cached_search(db, query_key)
            if cached_search and cached_search.jobs_json:
                return [
                    JobResponse(**job) if isinstance(job, dict) else job
                    for job in cached_search.jobs_json
                ]
        except Exception as e:
            logger.error("Error reading search_cache: %s", str(e), exc_info=True)

        if not settings.RAPIDAPI_KEY or "YOUR_RAPIDAPI" in settings.RAPIDAPI_KEY:
            raise JobsProviderError(
                "RapidAPI key is not configured. Real job searching requires a valid RAPIDAPI_KEY.",
                status_code=502,
            )

        headers = JSearchService._get_headers()
        params = {
            "query": query,
            "page": page,
            "num_pages": num_pages,
            "country": selected_country,
        }
        if location:
            params["location"] = location

        if date_posted and date_posted in ["all", "today", "3days", "week", "month"]:
            params["date_posted"] = date_posted

        if employment_type:
            val = employment_type.upper().replace("-", "")
            if val in ["FULLTIME", "CONTRACT", "PARTTIME", "INTERN"]:
                params["employment_types"] = val

        if remote == "yes":
            params["remote_jobs_only"] = "true"

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{JSearchService.BASE_URL}/search",
                    headers=headers,
                    params=params,
                )

            if response.status_code == 429:
                raise JobsProviderError(
                    "JSearch rate limit exceeded (HTTP 429). Please try again in a few moments.",
                    status_code=429,
                )
            if response.status_code in (401, 403):
                raise JobsProviderError(
                    f"RapidAPI authentication error (HTTP {response.status_code}). Verify RAPIDAPI_KEY.",
                    status_code=502,
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

            # Filter out expired postings
            active_jobs = [j for j in jobs if not _is_expired(j)]
            mapped_jobs = [map_job(job) for job in active_jobs]

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

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise JobsProviderError(
                    "JSearch rate limit exceeded. Please try again later.",
                    status_code=429,
                ) from e
            raise JobsProviderError(
                f"Upstream jobs provider returned HTTP {e.response.status_code}",
                status_code=502,
            ) from e
        except httpx.RequestError as e:
            raise JobsProviderError(
                f"Network error connecting to jobs provider: {e}",
                status_code=502,
            ) from e

    @staticmethod
    async def get_job(db: Session, job_id: str) -> JobResponse:
        try:
            cached_job = JobsRepository.get_cached_job(db, job_id)
            if cached_job and cached_job.data:
                return (
                    JobResponse(**cached_job.data)
                    if isinstance(cached_job.data, dict)
                    else cached_job.data
                )
        except Exception as e:
            logger.error("Error reading job_cache: %s", str(e), exc_info=True)

        if not settings.RAPIDAPI_KEY or "YOUR_RAPIDAPI" in settings.RAPIDAPI_KEY:
            raise JobsProviderError(
                "RapidAPI key is not configured. Job details require a valid RAPIDAPI_KEY.",
                status_code=502,
            )

        headers = JSearchService._get_headers()
        params = {"job_id": job_id}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{JSearchService.BASE_URL}/job-details",
                    headers=headers,
                    params=params,
                )
            if response.status_code == 429:
                raise JobsProviderError(
                    "JSearch rate limit exceeded (HTTP 429).",
                    status_code=429,
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

        except JobNotFoundException:
            raise
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise JobsProviderError("JSearch rate limit exceeded.", status_code=429) from e
            raise JobsProviderError(
                f"Upstream jobs provider error (HTTP {e.response.status_code})",
                status_code=502,
            ) from e
        except httpx.RequestError as e:
            raise JobsProviderError(
                f"Network error connecting to jobs provider: {e}",
                status_code=502,
            ) from e
