import logging
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_experience import UserExperience
from app.models.user_education import UserEducation

logger = logging.getLogger(__name__)


def extract_and_populate_profile(db: Session, user_id: int, resume_text: str):
    """
    Extract profile details from resume text using LLM and populate/update the user's profile database tables.
    """
    if not resume_text:
        logger.warning("No resume text provided for profile extraction")
        return None

    def split_date_str(date_str: str) -> tuple[str, str]:
        if not date_str:
            return "", ""
        parts = date_str.strip().split()
        if len(parts) >= 2:
            return parts[0], parts[1]
        elif len(parts) == 1:
            if parts[0].isdigit() and len(parts[0]) == 4:
                return "", parts[0]
            else:
                return parts[0], ""
        return "", ""

    try:
        from app.resume.services.local_resume_parser import parse_resume_text_locally

        parsed_local = parse_resume_text_locally(resume_text)

        data = {
            "full_name": parsed_local["contact"]["name"] or None,
            "headline": parsed_local["headline"] or None,
            "phone": parsed_local["contact"]["phone"] or None,
            "location": parsed_local["contact"]["location"] or None,
            "linkedin_url": parsed_local["contact"]["linkedin"] or None,
            "github_url": parsed_local["contact"]["github"] or None,
            "portfolio_url": parsed_local["contact"]["portfolio"] or None,
            "summary": parsed_local["summary"] or None,
            "skills": parsed_local["skills"],
            "projects": [],
            "experiences": [],
            "education": [],
        }

        for proj in parsed_local.get("projects", []):
            data["projects"].append(
                {
                    "title": proj.get("title") or "",
                    "description": proj.get("description") or "",
                    "tech_stack": ", ".join(proj.get("technologies", [])),
                    "github_url": proj.get("github_url") or None,
                    "live_url": proj.get("live_url") or None,
                }
            )

        for exp in parsed_local.get("experience", []):
            start_month, start_year = split_date_str(exp.get("start_date", ""))
            end_month, end_year = split_date_str(exp.get("end_date", ""))

            data["experiences"].append(
                {
                    "company": exp.get("company") or "",
                    "role": exp.get("role") or "",
                    "description": "\n".join(exp.get("bullets", [])),
                    "start_month": start_month or None,
                    "start_year": start_year or None,
                    "end_month": end_month or None,
                    "end_year": end_year or None,
                    "currently_working": exp.get("currently_working", False),
                }
            )

        for edu in parsed_local.get("education", []):
            data["education"].append(
                {
                    "institution": edu.get("institution") or "",
                    "degree": edu.get("degree") or "",
                    "start_year": edu.get("start_date") or None,
                    "end_year": edu.get("end_date") or None,
                }
            )
    except Exception as e:
        logger.error(f"Failed to parse locally or map profile data: {e}")
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
        # 3. Replace projects only when valid parsed projects exist
        projects = (
            data.get("projects")
            or data.get("user_projects")
            or data.get("personal_projects")
            or []
        )

        valid_projects = [
            project
            for project in projects
            if isinstance(project, dict)
            and str(project.get("title") or project.get("name") or "").strip()
        ]

        if valid_projects:
            db.query(UserProject).filter(UserProject.user_id == user_id).delete(
                synchronize_session=False
            )

            for project in valid_projects:
                title = project.get("title") or project.get("name")

                description = project.get("description") or project.get("desc") or ""

                technologies = (
                    project.get("tech_stack") or project.get("technologies") or ""
                )

                if isinstance(
                    technologies,
                    list,
                ):
                    technologies = ", ".join(str(item) for item in technologies if item)

                db.add(
                    UserProject(
                        user_id=user_id,
                        title=str(title).strip()[:255],
                        description=str(description).strip(),
                        tech_stack=str(technologies).strip(),
                        github_url=(str(project.get("github_url") or "")[:500] or None),
                        live_url=(str(project.get("live_url") or "")[:500] or None),
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

        valid_education = []

        for education in education_list:
            if not isinstance(
                education,
                dict,
            ):
                continue

            institution = (
                education.get("institution")
                or education.get("school")
                or education.get("university")
                or education.get("college")
                or ""
            )

            degree = (
                education.get("degree")
                or education.get("certification")
                or education.get("major")
                or ""
            )

            if str(institution).strip() and str(degree).strip():
                valid_education.append(education)

        if valid_education:
            db.query(UserEducation).filter(UserEducation.user_id == user_id).delete(
                synchronize_session=False
            )

            for education in valid_education:
                institution = (
                    education.get("institution")
                    or education.get("school")
                    or education.get("university")
                    or education.get("college")
                )

                degree = (
                    education.get("degree")
                    or education.get("certification")
                    or education.get("major")
                )

                db.add(
                    UserEducation(
                        user_id=user_id,
                        institution=str(institution).strip()[:255],
                        degree=str(degree).strip()[:255],
                        start_year=(
                            str(education.get("start_year") or "")[:20] or None
                        ),
                        end_year=(str(education.get("end_year") or "")[:20] or None),
                    )
                )

        db.commit()
        logger.info(f"Successfully populated profile from resume for user {user_id}")
        return data
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving populated profile to DB for user {user_id}: {e}")
        return None
