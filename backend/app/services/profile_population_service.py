import logging
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_experience import UserExperience
from app.models.user_education import UserEducation
from app.services.llm_service import call_llm_with_retry

logger = logging.getLogger(__name__)


def extract_and_populate_profile(db: Session, user_id: int, resume_text: str):
    """
    Extract profile details from resume text using LLM and populate/update the user's profile database tables.
    """
    if not resume_text:
        logger.warning("No resume text provided for profile extraction")
        return None

    prompt = f"""
    You are an expert AI Resume Parser. Your task is to extract all professional profile information from the candidate's resume text and structure it exactly into the specified JSON format.
    
    Resume Text:
    {resume_text}
    
    Instructions:
    - Extract the candidate's full name, professional headline, phone, location, LinkedIn URL, GitHub URL, Portfolio/Website URL, and a brief professional summary.
    - Extract the list of technical and professional skills as a flat list of strings.
    - Extract the projects with title, description, tech_stack (as comma-separated string of technologies used), github_url, and live_url.
    - Extract work experiences with company name, job role/title, description, start_month, start_year, end_month, end_year, and currently_working.
    - Extract education details with institution, degree, start_year, and end_year.
    - Do not invent any details. If any field or section is missing or cannot be found, leave it as null (for strings/URLs) or an empty array (for lists).
    - Ensure start_year and end_year under experiences are integers (or null if not found), and start_year and end_year under education are strings (or null).
    - Return ONLY valid JSON matching the schema below. Do not wrap in markdown or include extra text.
    
    JSON Schema:
    {{
      "full_name": "Full Name or null",
      "headline": "Professional headline (e.g. Full Stack Developer) or null",
      "phone": "Phone number or null",
      "location": "City, State/Country or null",
      "linkedin_url": "LinkedIn URL or null",
      "github_url": "GitHub URL or null",
      "portfolio_url": "Portfolio URL or null",
      "summary": "Professional summary paragraph or null",
      "skills": ["Skill 1", "Skill 2"],
      "projects": [
        {{
          "title": "Project Title",
          "description": "Description of the project",
          "tech_stack": "React, Node.js, PostgreSQL",
          "github_url": "GitHub repo URL or null",
          "live_url": "Deployed website URL or null"
        }}
      ],
      "experiences": [
        {{
          "company": "Company Name",
          "role": "Job Role",
          "description": "Job description",
          "start_month": "Start Month or null",
          "start_year": 2021,
          "end_month": "End Month or null",
          "end_year": 2023,
          "currently_working": false
        }}
      ],
      "education": [
        {{
          "institution": "University Name",
          "degree": "Degree name",
          "start_year": "2016",
          "end_year": "2020"
        }}
      ]
    }}
    """

    try:
        data = call_llm_with_retry(
            prompt,
            feature="profile_population",
            temperature=0.0,
            json_response=True,
        )
    except Exception as e:
        logger.error(f"Failed to call LLM for profile extraction: {e}")
        return None

    if not data or not isinstance(data, dict):
        logger.warning("LLM returned invalid profile data structure")
        return None

    try:
        # 1. Update or create Profile
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            profile = Profile(user_id=user_id)
            db.add(profile)

        profile.full_name = data.get("full_name") or profile.full_name
        profile.headline = data.get("headline") or profile.headline
        profile.phone = data.get("phone") or profile.phone
        profile.location = data.get("location") or profile.location
        profile.linkedin_url = data.get("linkedin_url") or profile.linkedin_url
        profile.github_url = data.get("github_url") or profile.github_url
        profile.portfolio_url = data.get("portfolio_url") or profile.portfolio_url
        profile.summary = data.get("summary") or profile.summary

        # 2. Clear & repopulate Skills
        db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()
        skills = (
            data.get("skills")
            or data.get("technical_skills")
            or data.get("key_skills")
            or []
        )
        for s in skills:
            if s and isinstance(s, str):
                db.add(UserSkill(user_id=user_id, skill_name=s.strip()[:100]))

        # 3. Clear & repopulate Projects
        db.query(UserProject).filter(UserProject.user_id == user_id).delete()
        projects = (
            data.get("projects")
            or data.get("user_projects")
            or data.get("personal_projects")
            or []
        )
        for p in projects:
            title = p.get("title") or p.get("name")
            desc = p.get("description") or p.get("desc") or ""
            if title:
                db.add(
                    UserProject(
                        user_id=user_id,
                        title=str(title)[:100],
                        description=str(desc),
                        tech_stack=str(
                            p.get("tech_stack") or p.get("technologies") or ""
                        ),
                        github_url=(
                            str(p.get("github_url") or "")[:500]
                            if p.get("github_url")
                            else None
                        ),
                        live_url=(
                            str(p.get("live_url") or "")[:500]
                            if p.get("live_url")
                            else None
                        ),
                    )
                )

        # 4. Clear & repopulate Experience
        db.query(UserExperience).filter(UserExperience.user_id == user_id).delete()
        experiences = (
            data.get("experiences")
            or data.get("work_experience")
            or data.get("experience")
            or []
        )
        for exp in experiences:
            company = (
                exp.get("company") or exp.get("employer") or exp.get("organization")
            )
            role = exp.get("role") or exp.get("title") or exp.get("position")
            if company and role:
                # Safely convert years to int
                s_year = exp.get("start_year")
                e_year = exp.get("end_year")
                try:
                    s_year = int(s_year) if s_year is not None else None
                except (ValueError, TypeError):
                    s_year = None
                try:
                    e_year = int(e_year) if e_year is not None else None
                except (ValueError, TypeError):
                    e_year = None

                db.add(
                    UserExperience(
                        user_id=user_id,
                        company=str(company)[:255],
                        role=str(role)[:255],
                        description=str(
                            exp.get("description") or exp.get("desc") or ""
                        ),
                        start_month=(
                            str(exp.get("start_month") or "")[:20]
                            if exp.get("start_month")
                            else None
                        ),
                        start_year=s_year,
                        end_month=(
                            str(exp.get("end_month") or "")[:20]
                            if exp.get("end_month")
                            else None
                        ),
                        end_year=e_year,
                        currently_working=bool(exp.get("currently_working", False)),
                    )
                )

        # 5. Clear & repopulate Education
        db.query(UserEducation).filter(UserEducation.user_id == user_id).delete()
        education_list = (
            data.get("education")
            or data.get("education_history")
            or data.get("academic_history")
            or []
        )
        for edu in education_list:
            inst = (
                edu.get("institution")
                or edu.get("school")
                or edu.get("university")
                or edu.get("college")
            )
            deg = edu.get("degree") or edu.get("certification") or edu.get("major")
            if inst and deg:
                db.add(
                    UserEducation(
                        user_id=user_id,
                        institution=str(inst)[:255],
                        degree=str(deg)[:100],
                        start_year=(
                            str(edu.get("start_year") or "")[:20]
                            if edu.get("start_year")
                            else None
                        ),
                        end_year=(
                            str(edu.get("end_year") or "")[:20]
                            if edu.get("end_year")
                            else None
                        ),
                    )
                )

        db.commit()
        logger.info(f"Successfully populated profile from resume for user {user_id}")
        return data
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving populated profile to DB for user {user_id}: {e}")
        return None
