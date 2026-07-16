import re
import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.jobs.repository.jobs_repository import JobsRepository
from app.jobs.services.resume_query_builder import ResumeQueryBuilder
from app.jobs.services.jsearch_service import JSearchService

logger = logging.getLogger(__name__)


def clean_headline_for_job_search(headline: str) -> str:
    if not headline:
        return ""
    h = headline.lower()

    # Remove common experience / level prefixes, suffixes or parentheticals
    patterns_to_remove = [
        r"\bentry[- ]level\b",
        r"\bmid[- ]level\b",
        r"\bco-op\b",
        r"\binternship\b",
        r"\bintern\b",
        r"\bjunior\b",
        r"\bmid\b",
        r"\bsenior\b",
        r"\blead\b",
        r"\bprincipal\b",
        r"\bexperience\b",
        r"\bexp\b",
        r"\byears\b",
        r"\byear\b",
        r"\byoe\b",
        r"\d+\+?\s*(yrs|years|yr|yoe|exp)?",
        r"\bwith\b",
        r"\bat\b",
        r"\bseeking\b",
        r"\blooking for\b",
        r"\bprofessional\b",
        r"\baspirant\b",
        r"\baspiring\b",
        r"\bopen to\b",
        r"\bopportunities\b",
    ]

    for pattern in patterns_to_remove:
        h = re.sub(pattern, " ", h)

    # Replace common separators/special chars with spaces
    h = re.sub(r"[|,\-/•()\[\]:;]", " ", h)

    # Collapse multiple spaces and strip
    words = [w.strip() for w in h.split() if w.strip()]
    cleaned = " ".join(words).title().strip()
    return cleaned


def clean_skill_for_search(skill: str) -> str:
    if not skill:
        return ""
    # Remove anything inside parentheses, e.g. "JavaScript (ES6+)" -> "JavaScript"
    s = re.sub(r"\(.*?\)", "", skill)
    # Remove trailing/leading special characters except # or + (for C# / C++)
    s = re.sub(r"[^\w\s#+.]", " ", s)
    return " ".join(s.split()).strip()


class JobsService:
    @staticmethod
    async def get_recommended_jobs(
        db: Session,
        current_user: User,
        location: str | None = None,
        employment_type: str | None = None,
        remote: str | None = None,
    ):
        headline = None
        skills = []

        profile = JobsRepository.get_user_profile(db, current_user.id)
        if profile and profile.headline:
            headline = profile.headline

        user_skills = JobsRepository.get_user_skills(db, current_user.id)
        if user_skills:
            skills = [s.skill_name for s in user_skills]

        latest_resume = JobsRepository.get_active_resume(db, current_user.id)
        if not latest_resume:
            latest_resume = JobsRepository.get_latest_resume(db, current_user.id)

        if latest_resume:
            resume_json = {}
            if latest_resume.resume_json:
                try:
                    import json

                    resume_json = json.loads(latest_resume.resume_json)
                except Exception:
                    resume_json = {}

            # --------------------------------------------------
            # 1. Headline from Active Resume JSON
            # --------------------------------------------------
            if not headline and resume_json:
                headline = (
                    resume_json.get("headline")
                    or resume_json.get("personal_info", {}).get("headline")
                    or ""
                ).strip()

            # --------------------------------------------------
            # 2. Skills from Active Resume JSON
            # --------------------------------------------------
            if not skills and resume_json:
                json_skills = resume_json.get("skills", [])
                if isinstance(json_skills, list):
                    cleaned = []
                    for s in json_skills:
                        if isinstance(s, str):
                            s = clean_skill_for_search(s)
                            if s:
                                cleaned.append(s)
                    skills = cleaned[:12]

            # --------------------------------------------------
            # 3. Fallback to parsed text ONLY if needed
            # --------------------------------------------------
            if not headline:
                filename = latest_resume.title or ""
                if "." in filename:
                    filename = filename.rsplit(".", 1)[0]
                filename_clean = filename.replace("_", " ").replace("-", " ").strip()
                job_keywords = [
                    "developer",
                    "engineer",
                    "designer",
                    "manager",
                    "analyst",
                    "architect",
                    "specialist",
                    "administrator",
                    "consultant",
                    "scientist",
                    "lead",
                    "programmer",
                    "tester",
                ]

                filename_lower = filename_clean.lower()
                if any(k in filename_lower for k in job_keywords):
                    headline = filename_clean
            if not skills and latest_resume.parsed_text:
                common_tech_skills = [
                    "Python",
                    "React",
                    "FastAPI",
                    "Flask",
                    "PostgreSQL",
                    "Docker",
                    "Git",
                    "JavaScript",
                    "TypeScript",
                    "HTML",
                    "CSS",
                ]

                text_lower = latest_resume.parsed_text.lower()
                extracted = []
                for s in common_tech_skills:
                    if s.lower() in text_lower:
                        extracted.append(s)
                skills = extracted

        # Clean headline and skills to ensure a clean, general job search query
        if headline:
            headline = clean_headline_for_job_search(headline)
        if not headline:
            headline = "Software Engineer"
        logger.info(
            "Job Search -> headline=%s skills=%s",
            headline,
            skills,
        )

        if skills:
            skills = [clean_skill_for_search(s) for s in skills]
            skills = [s for s in skills if s]
        else:
            skills = ["React", "Node.js", "Python", "SQL"]

        query = ResumeQueryBuilder.build_query(headline=headline, skills=skills)
        jobs = await JSearchService.search_jobs(
            db,
            query=query,
            location=location,
            employment_type=employment_type,
            remote=remote,
        )
        return jobs
