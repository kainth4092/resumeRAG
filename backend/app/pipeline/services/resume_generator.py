import json
import logging
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.models.job_context import JobContext
from app.models.user import User
from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text, ResumeDoc
from app.services.llm_service import generate_resume
from app.resume.services.resume_scoring_service import calculate_ats_score

logger = logging.getLogger(__name__)


def build_resume_doc_from_profile(db: Session, user: User) -> ResumeDoc:
    """Construct a canonical ResumeDoc from the user's saved profile records."""
    profile = user.profile
    skills = [s.skill_name for s in user.skills] if user.skills else []

    experience = []
    for exp in user.experiences:
        bullets = []
        if exp.description:
            bullets = [b.strip() for b in exp.description.split("\n") if b.strip()]
        experience.append({
            "company": exp.company_name,
            "role": exp.role,
            "location": exp.location or "",
            "start": exp.start_date.isoformat() if exp.start_date else None,
            "end": exp.end_date.isoformat() if exp.end_date else None,
            "current": exp.is_current,
            "bullets": bullets,
        })

    education = []
    for edu in user.educations:
        education.append({
            "institution": edu.institution,
            "degree": edu.degree,
            "start": str(edu.start_year) if edu.start_year else None,
            "end": str(edu.end_year) if edu.end_year else None,
            "grade": edu.grade or "",
        })

    projects = []
    for proj in user.projects:
        bullets = []
        if proj.description:
            bullets = [b.strip() for b in proj.description.split("\n") if b.strip()]
        projects.append({
            "title": proj.title,
            "bullets": bullets,
            "technologies": [t.strip() for t in proj.technologies.split(",") if t.strip()] if proj.technologies else [],
            "github_url": proj.link or "",
            "live_url": "",
        })

    raw_dict = {
        "contact": {
            "name": user.name or (profile.full_name if profile else "Professional"),
            "email": user.email,
            "phone": profile.phone if profile else "",
            "location": profile.location if profile else "",
            "linkedin": profile.linkedin if profile else "",
            "github": profile.github if profile else "",
            "portfolio": profile.website if profile else "",
        },
        "headline": profile.headline if profile else "Software Engineer",
        "summary": profile.bio if profile else "",
        "skills": skills,
        "experience": experience,
        "education": education,
        "projects": projects,
        "schema_version": 1,
    }
    return to_resume_doc(raw_dict)


async def generate_tailored_resume(
    db: Session,
    user_id: int,
    job_context: JobContext,
    source_resume_id: int | None = None,
    template: str = "Professional",
) -> tuple[Resume, dict, list[str], list[dict]]:
    """
    Step 2: Generate tailored resume from source resume or profile.
    Code owns structure, LLM owns wording.
    Guaranteed: NEVER modifies the source resume.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User id {user_id} not found")

    source_resume: Resume | None = None
    if source_resume_id:
        source_resume = (
            db.query(Resume)
            .filter(Resume.id == source_resume_id, Resume.user_id == user_id)
            .first()
        )
        if not source_resume:
            raise ValueError(f"Source resume id {source_resume_id} not found or not owned by user")
        # Load source ResumeDoc
        source_doc = to_resume_doc(source_resume.resume_json or source_resume.parsed_text)
    else:
        # Load from profile
        source_doc = build_resume_doc_from_profile(db, user)

    # Call LLM generation pipeline with strict validation and retry
    tailored_doc, skill_gaps, suggested_projects = generate_resume(
        resume=source_doc,
        job_description=job_context.raw_description,
    )

    # Calculate ATS score & explainable breakdown
    ats_breakdown = calculate_ats_score(
        resume=tailored_doc,
        job_description=job_context.raw_description,
        db=db,
    )

    ats_score = ats_breakdown.get("ats_score", 85)
    parsed_text = resume_doc_to_text(tailored_doc)

    # Save as NEW Resume row; source resume is completely untouched
    new_resume = Resume(
        user_id=user_id,
        title=f"{job_context.title or 'Tailored'} Resume",
        original_filename="Generated_Resume.pdf",
        file_path="",
        parsed_text=parsed_text,
        is_active=False,
        is_generated=True,
        source="generated",
        parent_resume_id=source_resume.id if source_resume else None,
        job_context_id=job_context.id,
        template=template,
        ats_score=ats_score,
        skills=", ".join(tailored_doc.skills),
        analysis_results=json.dumps(ats_breakdown),
        resume_json=tailored_doc.model_dump_json(),
        parsing_status="completed",
        parse_warnings=None,
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume, ats_breakdown, skill_gaps, suggested_projects
