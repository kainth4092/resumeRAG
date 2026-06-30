import re
import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.jobs.repository.jobs_repository import JobsRepository
from app.jobs.services.resume_query_builder import ResumeQueryBuilder
from app.jobs.services.jsearch_service import JSearchService

logger = logging.getLogger(__name__)

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
            if not headline:
                filename = latest_resume.title
                if "." in filename:
                    filename = filename.rsplit(".", 1)[0]
                filename_clean = filename.replace("_", " ").replace("-", " ").strip()

                job_keywords = [
                    "developer", "engineer", "designer", "manager", "analyst", "architect", 
                    "specialist", "administrator", "consultant", "scientist", "lead", 
                    "programmer", "strategist", "tester", "expert", "intern"
                ]
                
                filename_lower = filename_clean.lower()
                has_job_keyword = any(kw in filename_lower for kw in job_keywords)
                filler_words = ["resume", "cv", "portfolio", "profile", "bio", "job", "apply", "latest", "updated", "final"]
                has_filler = any(fw in filename_lower for fw in filler_words)

                extracted_headline = None
                if has_job_keyword and not has_filler:
                    extracted_headline = filename_clean
                elif latest_resume.parsed_text:
                    text_lines = [line.strip() for line in latest_resume.parsed_text.split("\n") if line.strip()][:30]
                    for line in text_lines:
                        line_lower = line.lower()
                        if len(line) < 80:
                            parts = [p.strip() for p in re.split(r'[|,\-/•]', line) if p.strip()]
                            for part in parts:
                                part_lower = part.lower()
                                if any(kw in part_lower for kw in job_keywords):
                                    if not any(w in part_lower for w in ["education", "experience", "skills", "projects", "summary", "@", "phone", "email"]):
                                        if current_user.name and current_user.name.lower() in part_lower:
                                            continue
                                        extracted_headline = part
                                        break
                            if extracted_headline:
                                break
                
                if not extracted_headline and has_job_keyword:
                    extracted_headline = filename_clean

                if extracted_headline:
                    headline = extracted_headline

            if not skills and latest_resume.parsed_text:
                common_tech_skills = [
                    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", 
                    "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS", "SQL", "NoSQL", "Docker", 
                    "Kubernetes", "AWS", "GCP", "Azure", "Git", "FastAPI", "Django", "Flask",
                    "Vue", "Angular", "Tailwind", "Bootstrap", "PostgreSQL", "MongoDB", "Redis"
                ]
                text_lower = latest_resume.parsed_text.lower()
                extracted = []
                for s in common_tech_skills:
                    if s.lower() in text_lower:
                        extracted.append(s)
                        if len(extracted) >= 5:
                            break
                if extracted:
                    skills = extracted

        if not headline:
            headline = "Full Stack Developer"
        if not skills:
            skills = ["React", "Node.js", "Python", "SQL"]

        query = ResumeQueryBuilder.build_query(headline=headline, skills=skills)
        jobs = await JSearchService.search_jobs(
            db, 
            query=query, 
            location=location,
            employment_type=employment_type,
            remote=remote
        )
        return jobs
