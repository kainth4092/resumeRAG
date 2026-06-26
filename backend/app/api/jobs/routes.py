import logging
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import JobNotFoundException
from app.services.jsearch_service import JSearchService
from app.services.resume_query_builder import ResumeQueryBuilder
from app.services.tracker_service import TrackerService
from app.schemas.tracker import SaveJobRequest, TrackedJobResponse

from app.models.resume import Resume
from app.models.profile import Profile
from app.models.user_skill import UserSkill

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("/search")
async def search_jobs(
    query: str,
    location: str | None = None,
    employment_type: str | None = None,
    remote: str | None = None,
    page: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JSearchService.search_jobs(
            db, 
            query=query, 
            page=page, 
            location=location,
            employment_type=employment_type,
            remote=remote
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in search_jobs: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/recommended")
async def recommended_jobs(
    location: str | None = None,
    employment_type: str | None = None,
    remote: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        headline = None
        skills = []

     
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile and profile.headline:
            headline = profile.headline

       
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
        if user_skills:
            skills = [s.skill_name for s in user_skills]

        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
        if not latest_resume:
            latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()

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
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in recommended_jobs: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")



@router.get("/{job_id}")
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return await JSearchService.get_job(db, job_id)

    except JobNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in get_job: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/save", response_model=TrackedJobResponse)
async def save_job(
    request: SaveJobRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        job = TrackerService.save_job(db, current_user.id, request)
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in save_job: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
