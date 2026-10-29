import re
import logging
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.models.job_context import JobContext
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.resume_doc import to_resume_doc
from app.services.roadmap.roadmap_service import (
    normalize_role,
    normalize_level,
    ROLE_CATALOG,
    build_roadmap_phases,
    build_learning_recommendations,
)
from app.core.skills_taxonomy import SKILLS_TAXONOMY

logger = logging.getLogger(__name__)


def slugify_task(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", name.lower()).strip("_")
    return cleaned or "item"


def build_pipeline_roadmap(
    db: Session,
    user_id: int,
    generated_resume: Resume,
    job_context: JobContext,
    suggested_projects: list[dict] | None = None,
) -> Roadmap:
    """
    Step 5: Generate a per-resume roadmap.
    - target role = normalize_role(job_context.title) with fallback "Software Engineer"
    - level from candidate_level + JD seniority
    - required skills = catalog skills UNION job_context.required_skills (priority High)
    - current skills = generated resume skills + profile skills via skills_taxonomy
    - stable task ids
    - include suggested_projects as portfolio tasks
    """
    user = db.query(User).filter(User.id == user_id).first()
    resume_doc = to_resume_doc(generated_resume.resume_json or generated_resume.parsed_text)

    # 1. Target role and level
    raw_title = job_context.title or resume_doc.headline or "Software Engineer"
    target_role = normalize_role(raw_title)

    # Seniority level
    raw_seniority = (job_context.seniority or "Mid").lower()
    if any(s in raw_seniority for s in ["lead", "principal", "senior", "staff"]):
        target_level = "Senior"
    elif any(s in raw_seniority for s in ["junior", "entry", "intern"]):
        target_level = "Junior"
    else:
        target_level = "Mid-Level"

    target_level = normalize_level(target_level)

    # 2. Extract catalog config with fallback
    catalog_role_config = ROLE_CATALOG.get(target_role) or ROLE_CATALOG.get("Software Engineer", {})
    level_config = catalog_role_config.get(target_level) or catalog_role_config.get("Mid-Level", {})
    catalog_skills = level_config.get("skills", [])

    # 3. Union catalog skills with job_context.required_skills (priority High)
    seen_skills = set()
    combined_requirements = []

    # Add JD required skills first as High priority
    for s in (job_context.required_skills or []):
        s_clean = s.strip()
        if s_clean and s_clean.lower() not in seen_skills:
            seen_skills.add(s_clean.lower())
            combined_requirements.append({
                "name": s_clean,
                "priority": "High",
                "weight": 3,
            })

    # Union with catalog skills
    for cs in catalog_skills:
        name = cs.get("name", "").strip()
        if name and name.lower() not in seen_skills:
            seen_skills.add(name.lower())
            combined_requirements.append(cs)

    # 4. Current skills = generated resume skills + profile skills via skills_taxonomy
    current_skill_set = set()
    for s in resume_doc.skills:
        current_skill_set.add(s.lower())
        # Check taxonomy canonical
        tax_entry = SKILLS_TAXONOMY.get(s.lower())
        if tax_entry:
            current_skill_set.add(tax_entry.canonical_name.lower())
            for alias in tax_entry.aliases:
                current_skill_set.add(alias.lower())

    if user and user.skills:
        for ps in user.skills:
            current_skill_set.add(ps.skill_name.lower())

    # 5. Missing skills
    missing_skills = []
    matched_skills = []
    for req in combined_requirements:
        name = req.get("name", "")
        is_matched = (
            name.lower() in current_skill_set
            or any(alias.lower() in current_skill_set for alias in (SKILLS_TAXONOMY.get(name.lower(), None).aliases if SKILLS_TAXONOMY.get(name.lower()) else []))
        )
        if is_matched:
            matched_skills.append({**req, "matched": True})
        else:
            missing_skills.append({**req, "matched": False})

    # 6. Build roadmap phases
    phases = build_roadmap_phases(
        missing_skills=missing_skills,
        target_role=target_role,
        target_level=target_level,
    )

    # Assign stable, deterministic task IDs to all phases
    for p_idx, phase in enumerate(phases):
        for t_idx, task in enumerate(phase.get("tasks", [])):
            task_slug = slugify_task(task.get("skill") or task.get("title", ""))
            task["id"] = f"phase_{p_idx+1}_{task_slug}_{t_idx}"

    # Append suggested_projects as portfolio tasks in the final phase
    if suggested_projects:
        portfolio_phase = phases[-1] if phases else {"title": "Phase: Portfolio & Preparation", "tasks": []}
        for sp_idx, sp in enumerate(suggested_projects):
            techs = ", ".join(sp.get("technologies", []))
            task_title = f"Build Project: {sp.get('title', 'Portfolio Project')} ({techs})"
            portfolio_phase.setdefault("tasks", []).append({
                "id": f"phase_portfolio_suggested_{sp_idx}",
                "title": task_title,
                "skill": "Portfolio Project",
                "completed": False,
                "description": sp.get("description", ""),
            })

    # Learning recommendations
    learning_recommendations = build_learning_recommendations(missing_skills)

    plan = {
        "target_role": target_role,
        "target_level": target_level,
        "readiness": round((len(matched_skills) / max(1, len(combined_requirements))) * 100),
        "required_skills": combined_requirements,
        "current_skills": matched_skills,
        "missing_skills": missing_skills,
        "roadmap": phases,
        "learning_recommendations": learning_recommendations,
        "suggested_projects": suggested_projects or [],
    }

    roadmap_record = Roadmap(
        user_id=user_id,
        resume_id=generated_resume.id,
        job_context_id=job_context.id,
        target_role=target_role,
        target_level=target_level,
        plan=plan,
        completed_tasks=[],
    )
    db.add(roadmap_record)
    db.commit()
    db.refresh(roadmap_record)
    return roadmap_record
