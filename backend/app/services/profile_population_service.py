import logging
import re
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_experience import UserExperience
from app.models.user_education import UserEducation

logger = logging.getLogger(__name__)


def _norm(val: str | None) -> str:
    if not val:
        return ""
    return re.sub(r"\s+", " ", str(val).strip().lower())


def extract_and_populate_profile(db: Session, user_id: int, resume_text: str) -> dict:
    """
    Extract profile details from resume text and perform a non-destructive upsert into
    the user's profile database tables without deleting existing user data.
    """
    if not resume_text or not resume_text.strip():
        logger.warning("No resume text provided for profile extraction")
        return {"added": 0, "updated": 0, "skipped": 0}

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
    except Exception as e:
        logger.error(f"Failed to parse locally: {e}")
        return {"added": 0, "updated": 0, "skipped": 0}

    if not parsed_local:
        return {"added": 0, "updated": 0, "skipped": 0}

    added = 0
    updated = 0
    skipped = 0

    try:
        # 1. Update or create Profile (fill blank fields without overwriting user-entered ones)
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            profile = Profile(user_id=user_id)
            db.add(profile)
            added += 1

        contact = parsed_local.get("contact", {}) or {}
        new_name = (contact.get("name") or "").strip()[:150]
        new_headline = (parsed_local.get("headline") or "").strip()[:150]
        new_phone = (contact.get("phone") or "").strip()[:20]
        new_location = (contact.get("location") or "").strip()[:150]
        new_linkedin = (contact.get("linkedin") or "").strip()[:255]
        new_github = (contact.get("github") or "").strip()[:255]
        new_portfolio = (contact.get("portfolio") or "").strip()[:255]
        new_summary = (parsed_local.get("summary") or "").strip()

        if new_name and not profile.full_name:
            profile.full_name = new_name
            updated += 1
        if new_headline and not profile.headline:
            profile.headline = new_headline
            updated += 1
        if new_phone and not profile.phone:
            profile.phone = new_phone
            updated += 1
        if new_location and not profile.location:
            profile.location = new_location
            updated += 1
        if new_linkedin and not profile.linkedin_url:
            profile.linkedin_url = new_linkedin
            updated += 1
        if new_github and not profile.github_url:
            profile.github_url = new_github
            updated += 1
        if new_portfolio and not profile.portfolio_url:
            profile.portfolio_url = new_portfolio
            updated += 1
        if new_summary and not profile.summary:
            profile.summary = new_summary
            updated += 1

        # 2. Non-destructive Upsert Skills
        existing_skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        existing_skill_names = {_norm(s.skill_name) for s in existing_skills if s.skill_name}

        skills = parsed_local.get("skills", [])
        for s in skills:
            if not s or not isinstance(s, str):
                continue
            s_clean = s.strip()[:100]
            if not s_clean:
                continue
            if _norm(s_clean) in existing_skill_names:
                skipped += 1
            else:
                db.add(UserSkill(user_id=user_id, skill_name=s_clean))
                existing_skill_names.add(_norm(s_clean))
                added += 1

        # 3. Non-destructive Upsert Projects
        existing_projects = db.query(UserProject).filter(UserProject.user_id == user_id).all()
        project_map = {_norm(p.title): p for p in existing_projects if p.title}

        for proj in parsed_local.get("projects", []):
            if not isinstance(proj, dict):
                continue
            title = (proj.get("title") or proj.get("name") or "").strip()[:100]
            if not title:
                continue
            norm_title = _norm(title)
            desc = (proj.get("description") or "").strip()
            techs = proj.get("technologies") or proj.get("tech_stack") or ""
            if isinstance(techs, list):
                techs = ", ".join(str(t) for t in techs if t)
            tech_stack = str(techs).strip()
            gh_url = (proj.get("github_url") or "").strip()[:500] or None
            live_url = (proj.get("live_url") or "").strip()[:500] or None

            if norm_title in project_map:
                p_entry = project_map[norm_title]
                changed = False
                if desc and not p_entry.description:
                    p_entry.description = desc
                    changed = True
                if tech_stack and not p_entry.tech_stack:
                    p_entry.tech_stack = tech_stack
                    changed = True
                if gh_url and not p_entry.github_url:
                    p_entry.github_url = gh_url
                    changed = True
                if live_url and not p_entry.live_url:
                    p_entry.live_url = live_url
                    changed = True
                if changed:
                    updated += 1
                else:
                    skipped += 1
            else:
                db.add(
                    UserProject(
                        user_id=user_id,
                        title=title,
                        description=desc,
                        tech_stack=tech_stack or None,
                        github_url=gh_url,
                        live_url=live_url,
                    )
                )
                added += 1

        # 4. Non-destructive Upsert Experience
        existing_exps = db.query(UserExperience).filter(UserExperience.user_id == user_id).all()
        exp_map = {(_norm(e.company), _norm(e.role)): e for e in existing_exps if e.company and e.role}

        for exp in parsed_local.get("experience", []):
            if not isinstance(exp, dict):
                continue
            company = (exp.get("company") or "").strip()[:255]
            role = (exp.get("role") or "").strip()[:255]
            if not company or not role:
                continue
            key = (_norm(company), _norm(role))
            bullets = exp.get("bullets", [])
            desc = ("\n".join(bullets) if isinstance(bullets, list) else str(exp.get("description", ""))).strip()
            start_m, start_y = split_date_str(exp.get("start_date", ""))
            end_m, end_y = split_date_str(exp.get("end_date", ""))

            s_year = int(start_y) if start_y.isdigit() else None
            e_year = int(end_y) if end_y.isdigit() else None

            if key in exp_map:
                e_entry = exp_map[key]
                changed = False
                if desc and not e_entry.description:
                    e_entry.description = desc
                    changed = True
                if s_year and not e_entry.start_year:
                    e_entry.start_year = s_year
                    changed = True
                if e_year and not e_entry.end_year:
                    e_entry.end_year = e_year
                    changed = True
                if changed:
                    updated += 1
                else:
                    skipped += 1
            else:
                db.add(
                    UserExperience(
                        user_id=user_id,
                        company=company,
                        role=role,
                        description=desc,
                        start_month=start_m[:20] if start_m else None,
                        start_year=s_year,
                        end_month=end_m[:20] if end_m else None,
                        end_year=e_year,
                        currently_working=bool(exp.get("currently_working", False)),
                    )
                )
                added += 1

        # 5. Non-destructive Upsert Education
        existing_edus = db.query(UserEducation).filter(UserEducation.user_id == user_id).all()
        edu_map = {(_norm(ed.institution), _norm(ed.degree)): ed for ed in existing_edus if ed.institution and ed.degree}

        for edu in parsed_local.get("education", []):
            if not isinstance(edu, dict):
                continue
            inst = (edu.get("institution") or "").strip()[:255]
            deg = (edu.get("degree") or "").strip()[:100]
            if not inst or not deg:
                continue
            key = (_norm(inst), _norm(deg))
            s_yr = str(edu.get("start_date") or "")[:20] or None
            e_yr = str(edu.get("end_date") or "")[:20] or None

            if key in edu_map:
                ed_entry = edu_map[key]
                changed = False
                if s_yr and not ed_entry.start_year:
                    ed_entry.start_year = s_yr
                    changed = True
                if e_yr and not ed_entry.end_year:
                    ed_entry.end_year = e_yr
                    changed = True
                if changed:
                    updated += 1
                else:
                    skipped += 1
            else:
                db.add(
                    UserEducation(
                        user_id=user_id,
                        institution=inst,
                        degree=deg,
                        start_year=s_yr,
                        end_year=e_yr,
                    )
                )
                added += 1

        db.commit()
        return {"added": added, "updated": updated, "skipped": skipped}

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to upsert profile data: {e}", exc_info=True)
        return {"added": 0, "updated": 0, "skipped": 0}
