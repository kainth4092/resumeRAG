import hashlib
import logging
import re
from sqlalchemy.orm import Session
from app.models.job_context import JobContext
from app.schemas.pipeline import JobContextExtraction
from app.services.llm_service import llm_json
from app.core.skills_taxonomy import SKILLS_TAXONOMY

logger = logging.getLogger(__name__)


def clean_and_hash_description(text: str) -> tuple[str, str]:
    """Normalize text and compute deterministic SHA-256 hash."""
    cleaned = re.sub(r"\s+", " ", text).strip()
    desc_hash = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
    return cleaned, desc_hash


def fallback_extract_job_context(
    cleaned_jd: str,
    title: str | None = None,
    company: str | None = None,
    role: str | None = None,
) -> JobContextExtraction:
    """Pure-Python taxonomy fallback when LLM structured extraction is unavailable."""
    text_lower = cleaned_jd.lower()
    found_skills = []

    for name, entry in SKILLS_TAXONOMY.items():
        if entry.canonical_name.lower() in text_lower:
            found_skills.append(entry.canonical_name)
        else:
            for alias in entry.aliases:
                if f" {alias.lower()} " in f" {text_lower} ":
                    found_skills.append(entry.canonical_name)
                    break

    # Determine seniority
    seniority = "Mid"
    if any(w in text_lower for w in ["lead", "principal", "director", "staff"]):
        seniority = "Lead"
    elif any(w in text_lower for w in ["senior", "sr.", "5+ years", "7+ years", "8+ years"]):
        seniority = "Senior"
    elif any(w in text_lower for w in ["junior", "entry-level", "entry level", "intern", "associate"]):
        seniority = "Junior"

    resolved_title = title or role or "Software Engineer"
    return JobContextExtraction(
        title=resolved_title,
        company=company,
        seniority=seniority,
        location="Remote" if "remote" in text_lower else None,
        required_skills=list(dict.fromkeys(found_skills[:15])),
        preferred_skills=[],
        keywords=list(dict.fromkeys(found_skills[:10])),
        responsibilities=[],
    )


async def extract_or_get_job_context(
    db: Session,
    user_id: int,
    job_description: str,
    title: str | None = None,
    company: str | None = None,
    role: str | None = None,
    source_job_id: str | None = None,
    source_url: str | None = None,
) -> JobContext:
    """
    Step 1: Extract and cache JobContext by description_hash.
    Uses llm_json(temperature=0.0) with pure-Python taxonomy fallback.
    """
    cleaned_jd, desc_hash = clean_and_hash_description(job_description)

    # Check database cache first
    cached = (
        db.query(JobContext)
        .filter(JobContext.description_hash == desc_hash)
        .first()
    )
    if cached:
        logger.info("Found cached JobContext id=%s for hash=%s", cached.id, desc_hash[:8])
        # Update user/source metadata if empty
        if not cached.user_id and user_id:
            cached.user_id = user_id
        if not cached.source_job_id and source_job_id:
            cached.source_job_id = source_job_id
        db.commit()
        return cached

    prompt = f"""You are an expert technical recruiter analyzing a job description.
Extract structured hiring criteria from the following job description.

Job Description:
\"\"\"
{cleaned_jd[:6000]}
\"\"\"

Requirements:
- title: standard job title (e.g. "Senior Frontend Engineer")
- company: hiring company name if mentioned
- seniority: one of ["Entry", "Junior", "Mid", "Senior", "Lead"]
- location: location or "Remote"
- required_skills: exact technical skills, languages, frameworks, or tools explicitly required
- preferred_skills: nice-to-have or preferred technical skills
- keywords: domain concepts, architecture paradigms, or methodology terms
- responsibilities: 3-5 core duties
"""

    extraction: JobContextExtraction | None = None
    try:
        extraction = await llm_json(
            prompt=prompt,
            response_model=JobContextExtraction,
            feature="pipeline_context_extractor",
            temperature=0.0,
        )
    except Exception as e:
        logger.warning("LLM extraction failed for JobContext: %s. Using taxonomy fallback.", str(e))
        extraction = fallback_extract_job_context(
            cleaned_jd=cleaned_jd,
            title=title,
            company=company,
            role=role,
        )

    if not extraction:
        extraction = fallback_extract_job_context(
            cleaned_jd=cleaned_jd,
            title=title,
            company=company,
            role=role,
        )

    resolved_title = title or extraction.title or role or "Software Engineer"
    resolved_company = company or extraction.company

    new_context = JobContext(
        user_id=user_id,
        raw_description=cleaned_jd,
        description_hash=desc_hash,
        title=resolved_title,
        company=resolved_company,
        seniority=extraction.seniority or "Mid",
        location=extraction.location,
        required_skills=extraction.required_skills,
        preferred_skills=extraction.preferred_skills,
        keywords=extraction.keywords,
        responsibilities=extraction.responsibilities,
        source_job_id=source_job_id,
        source_url=source_url,
    )
    db.add(new_context)
    db.commit()
    db.refresh(new_context)
    return new_context
