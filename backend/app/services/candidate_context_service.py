import re
import hashlib
import json
from typing import Any


EXPERIENCE_PATTERNS = [
    r"\b(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience\b",
    r"\bexperience\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b",
    r"\bover\s+(\d+(?:\.\d+)?)\s+(?:years?|yrs?)\b",
    r"\bmore\s+than\s+(\d+(?:\.\d+)?)\s+(?:years?|yrs?)\b",
]


def normalize_text(value: str) -> str:
    return " ".join((value or "").lower().split())


def extract_claimed_experience_years(
    resume_text: str,
    summary: str = "",
    headline: str = "",
) -> float:
    """
    Detect explicitly claimed experience from the complete resume,
    summary, or headline.

    Examples:
    - 6.5+ years of experience
    - over 4 years
    - experience of 3 years
    """
    combined_text = " ".join(
        [
            resume_text or "",
            summary or "",
            headline or "",
        ]
    )

    detected_years = []

    for pattern in EXPERIENCE_PATTERNS:
        matches = re.findall(
            pattern,
            combined_text,
            flags=re.IGNORECASE,
        )

        for match in matches:
            try:
                detected_years.append(float(match))
            except (TypeError, ValueError):
                continue

    return max(detected_years, default=0.0)


def infer_candidate_level(
    resume_text: str,
    experience_entries: list | None = None,
    summary: str = "",
    headline: str = "",
) -> dict[str, Any]:
    """
    Candidate level is inferred from:
    1. Explicit experience claims anywhere in the resume.
    2. Structured work-experience records.

    Internship/training is retained as candidate experience context,
    but it does not automatically make a fresher senior.
    """

    experience_entries = experience_entries or []

    claimed_years = extract_claimed_experience_years(
        resume_text=resume_text,
        summary=summary,
        headline=headline,
    )

    professional_entries = []
    internship_entries = []

    internship_terms = {
        "intern",
        "internship",
        "trainee",
        "training",
        "apprentice",
    }

    for entry in experience_entries:
        if not isinstance(entry, dict):
            continue

        role = str(
            entry.get("role") or entry.get("title") or entry.get("position") or ""
        ).lower()

        if any(term in role for term in internship_terms):
            internship_entries.append(entry)
        else:
            professional_entries.append(entry)

    if claimed_years >= 5:
        level = "senior"
        difficulty = {
            "easy": 10,
            "medium": 45,
            "hard": 45,
        }

    elif claimed_years >= 2 or len(professional_entries) >= 2:
        level = "experienced"
        difficulty = {
            "easy": 15,
            "medium": 55,
            "hard": 30,
        }

    elif claimed_years > 0 or professional_entries:
        level = "junior_experienced"
        difficulty = {
            "easy": 25,
            "medium": 60,
            "hard": 15,
        }

    else:
        level = "fresher"
        difficulty = {
            "easy": 55,
            "medium": 40,
            "hard": 5,
        }

    return {
        "candidate_level": level,
        "claimed_experience_years": claimed_years,
        "professional_experience_count": len(professional_entries),
        "internship_or_training_count": len(internship_entries),
        "difficulty_distribution": difficulty,
    }


def build_analysis_hash(
    *,
    user_id: int,
    resume_id: int | str,
    resume_text: str,
    job_description: str = "",
    analysis_type: str,
    prompt_version: str,
) -> str:
    """
    Same user + resume + JD + analysis type + prompt version
    always creates the same deterministic cache key.

    Different users can never share cached private results.
    """

    payload = {
        "user_id": str(user_id),
        "resume_id": str(resume_id),
        "resume_text": normalize_text(resume_text),
        "job_description": normalize_text(job_description),
        "analysis_type": analysis_type,
        "prompt_version": prompt_version,
    }

    serialized = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
    )

    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
