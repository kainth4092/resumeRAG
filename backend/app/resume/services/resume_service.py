import base64
import json
import logging
import tempfile
import uuid
import hashlib
from pathlib import Path
from fastapi import UploadFile, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.resume.repository.resume_repository import ResumeRepository
from app.services.pdf_service import extract_text_from_pdf


logger = logging.getLogger(__name__)


def parse_resume_background_task(resume_id: int, user_id: int, parsed_text: str):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            logger.error(f"[BG_PARSING] Resume id {resume_id} not found")
            return
        
        resume.parsing_status = "processing"
        db.commit()

        from app.resume.services.resume_analysis_service import parse_resume_text_to_json
        from app.resume.services.resume_normalizer import normalize_resume
        from app.resume.services.resume_scoring_service import calculate_scores

        parsed_json = parse_resume_text_to_json(parsed_text)
        normalized = normalize_resume(parsed_json)
        scores = calculate_scores(normalized)

        resume.resume_json = json.dumps(normalized)
        resume.skills = ",".join(normalized.get("skills", []))
        resume.ats_score = scores["ats_score"]
        
        resume.analysis_results = json.dumps({
            "ats_score": scores["ats_score"],
            "matched_keywords": scores["matched_keywords"],
            "missing_keywords": scores["missing_keywords"],
            "suggestions": [
                "Include specific metrics (e.g. 'improved performance by 20%')",
                "Add details about cloud deployment (AWS/GCP)",
                "Strengthen your professional summary by aligning with target roles",
                "List individual Docker/CI/CD tool integrations",
                "Format project sections with clear technology listings",
            ],
            "heatmap": {
                "contact_info": scores["formatting_score"],
                "summary": scores["readability_score"],
                "skills": scores["skills_coverage"],
                "experience": scores["experience_quality"],
                "projects": scores["projects_quality"],
                "education": scores["education_quality"],
            },
        })
        resume.scoring_version = "v1"
        resume.prompt_version = "v1"
        resume.parsing_status = "completed"
        db.commit()

        from app.models.user_experience import UserExperience
        from app.services.profile_population_service import extract_and_populate_profile

        exp_count = (
            db.query(UserExperience)
            .filter(UserExperience.user_id == user_id)
            .count()
        )
        if exp_count == 0:
            extract_and_populate_profile(db, user_id, parsed_text)

        logger.info(f"[BG_PARSING] Successfully parsed resume id {resume_id}")
    except Exception as e:
        logger.exception(f"[BG_PARSING_FAILED] Failed to parse resume in background: {e}")
        try:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                resume.parsing_status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


class ResumeService:
    @staticmethod
    async def upload_resume(
        file: UploadFile,
        db: Session,
        user_id: int,
        background_tasks: BackgroundTasks,
    ) -> dict:
        file_ext = Path(file.filename).suffix.lower()
        allowed_content_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ]
        if (
            file_ext not in [".pdf", ".docx"]
            and file.content_type not in allowed_content_types
        ):
            raise HTTPException(
                status_code=400, detail="Only PDF and DOCX files are allowed."
            )
        unique_name = f"{uuid.uuid4()}_{file.filename}"

        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename).suffix.lower() or file_ext or ".bin"

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, detail="File size must not exceed 5 MB."
            )

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                delete=False, dir=upload_dir, suffix=suffix
            ) as temp_file:
                temp_file.write(content)
                temp_path = Path(temp_file.name)

            if file_ext == ".pdf":
                parsed_text = extract_text_from_pdf(str(temp_path))
            else:
                from app.services.docx_service import extract_text_from_docx
                parsed_text = extract_text_from_docx(str(temp_path))
        except Exception:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=400, detail="Unable to read PDF or DOCX file."
            )
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

        # Generate content hash of raw extracted text
        content_hash = hashlib.sha256(parsed_text.encode("utf-8")).hexdigest()

        # Check for a duplicate resume with the same content hash that has been successfully parsed and normalized.
        duplicate_resume = (
            db.query(Resume)
            .filter(
                Resume.user_id == user_id,
                Resume.canonical_hash == content_hash,
                Resume.parsing_status == "completed",
                Resume.resume_json.isnot(None),
            )
            .first()
        )

        if duplicate_resume:
            logger.info("Found duplicate parsed resume. Reusing data.")
            resume = Resume(
                user_id=user_id,
                title=file.filename,
                original_filename=file.filename,
                file_path=unique_name,
                file_content_base64=base64.b64encode(content).decode("utf-8"),
                parsed_text=duplicate_resume.parsed_text,
                ats_score=duplicate_resume.ats_score,
                skills=duplicate_resume.skills,
                analysis_results=duplicate_resume.analysis_results,
                version=duplicate_resume.version or "v1",
                template=duplicate_resume.template or "Professional",
                resume_json=duplicate_resume.resume_json,
                canonical_hash=content_hash,
                parsing_status="completed",
                scoring_version=duplicate_resume.scoring_version,
                prompt_version=duplicate_resume.prompt_version,
            )
            ResumeRepository.create_resume(db, resume)

            # Duplicate ResumeHealthAnalysis if it exists
            dup_health = (
                db.query(ResumeHealthAnalysis)
                .filter(ResumeHealthAnalysis.resume_id == duplicate_resume.id)
                .first()
            )
            if dup_health:
                new_health = ResumeHealthAnalysis(
                    resume_id=resume.id,
                    ats_score=dup_health.ats_score,
                    resume_health_score=dup_health.resume_health_score,
                    formatting_score=dup_health.formatting_score,
                    readability_score=dup_health.readability_score,
                    skills_coverage=dup_health.skills_coverage,
                    experience_quality=dup_health.experience_quality,
                    projects_quality=dup_health.projects_quality,
                    education_quality=dup_health.education_quality,
                    keyword_optimization=dup_health.keyword_optimization,
                    grammar_writing=dup_health.grammar_writing,
                    section_completeness=dup_health.section_completeness,
                    recruiter_readiness=dup_health.recruiter_readiness,
                    suggestions=dup_health.suggestions,
                    missing_sections=dup_health.missing_sections,
                    strengths=dup_health.strengths,
                    weaknesses=dup_health.weaknesses,
                    canonical_hash=dup_health.canonical_hash,
                    scoring_version=dup_health.scoring_version,
                    prompt_version=dup_health.prompt_version,
                    analysis_type=dup_health.analysis_type,
                    jd_hash=dup_health.jd_hash,
                )
                db.add(new_health)
                db.commit()

            return {
                "message": "Resume uploaded (reused cache)",
                "resume_id": resume.id,
                "parsing_status": "completed",
                "profile_extracted": False,
            }

        # Create new resume record with pending parsing status
        resume = Resume(
            user_id=user_id,
            title=file.filename,
            original_filename=file.filename,
            file_path=unique_name,
            file_content_base64=base64.b64encode(content).decode("utf-8"),
            parsed_text=parsed_text,
            ats_score=None,
            skills=None,
            analysis_results=None,
            version="v1",
            template="Professional",
            resume_json=None,
            canonical_hash=content_hash,
            parsing_status="pending",
        )
        try:
            ResumeRepository.create_resume(db, resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Database error occurred.")

        # Queue the background parsing task
        background_tasks.add_task(
            parse_resume_background_task,
            resume_id=resume.id,
            user_id=user_id,
            parsed_text=parsed_text,
        )

        return {
            "message": "Resume uploaded (parsing initiated)",
            "resume_id": resume.id,
            "parsing_status": "pending",
            "profile_extracted": False,
        }

    @staticmethod
    def set_active_resume(
        resume_id: int,
        db: Session,
        user_id: int,
    ) -> dict:
        resume = ResumeRepository.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

        ResumeRepository.deactivate_all_resumes(db, user_id)
        resume.is_active = True

        try:
            db.commit()
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Failed to update active status."
            )

        return {"message": "Resume set as active", "resume_id": resume.id}

    @staticmethod
    def list_resumes(
        db: Session,
        user_id: int,
    ) -> list[dict]:
        resumes = ResumeRepository.list_resumes_desc(db, user_id)
        return [
            {
                "id": r.id,
                "title": r.title,
                "original_filename": r.original_filename,
                "is_active": r.is_active,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "ats_score": r.ats_score,
                "skills": (
                    [s.strip() for s in r.skills.split(",") if s.strip()]
                    if r.skills
                    else []
                ),
                "analysis_results": (
                    json.loads(r.analysis_results) if r.analysis_results else None
                ),
                "version": r.version or "v1",
                "template": r.template or "Professional",
                "resume_json": json.loads(r.resume_json) if r.resume_json else None,
                "parsing_status": r.parsing_status or "completed",
            }
            for r in resumes
        ]

    @staticmethod
    def get_resume_by_id(
        resume_id: int,
        db: Session,
        user_id: int,
    ) -> dict:
        resume = ResumeRepository.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")
        return {
            "id": resume.id,
            "title": resume.title,
            "original_filename": resume.original_filename,
            "is_active": resume.is_active,
            "created_at": resume.created_at.isoformat() if resume.created_at else None,
            "ats_score": resume.ats_score,
            "skills": (
                [s.strip() for s in resume.skills.split(",") if s.strip()]
                if resume.skills
                else []
            ),
            "analysis_results": (
                json.loads(resume.analysis_results) if resume.analysis_results else None
            ),
            "version": resume.version or "v1",
            "template": resume.template or "Professional",
            "resume_json": json.loads(resume.resume_json) if resume.resume_json else None,
            "parsing_status": resume.parsing_status or "completed",
        }

    @staticmethod
    def get_active_resume(
        db: Session,
        user_id: int,
    ) -> dict:
        resume = ResumeRepository.get_active_resume(db, user_id)
        if not resume:
            return {"active_resume_id": None}
        return {
            "active_resume_id": resume.id,
            "title": resume.title,
            "original_filename": resume.original_filename,
        }

    @staticmethod
    def import_profile_to_resume(db: Session, user_id: int) -> dict:
        from app.models.profile import Profile
        from app.models.user_skill import UserSkill
        from app.models.user_project import UserProject
        from app.models.user_experience import UserExperience
        from app.models.user_education import UserEducation

        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        projects = db.query(UserProject).filter(UserProject.user_id == user_id).all()
        experiences = (
            db.query(UserExperience).filter(UserExperience.user_id == user_id).all()
        )
        education = (
            db.query(UserEducation).filter(UserEducation.user_id == user_id).all()
        )

        if (
            not profile
            and not skills
            and not projects
            and not experiences
            and not education
        ):
            raise HTTPException(
                status_code=400,
                detail="Profile is completely empty. Please enter your profile information first.",
            )

        contact = {
            "name": profile.full_name or "" if profile else "",
            "email": "",
            "phone": profile.phone or "" if profile else "",
            "location": profile.location or "" if profile else "",
            "linkedin": profile.linkedin_url or "" if profile else "",
            "github": profile.github_url or "" if profile else "",
            "portfolio": profile.portfolio_url or "" if profile else "",
        }
        headline = profile.headline or "" if profile else ""
        summary = profile.summary or "" if profile else ""

        skills_list = [s.skill_name for s in skills] if skills else []

        experience_list = []
        for exp in experiences:
            bullets = []
            if exp.description:
                bullets = [
                    item.strip() for item in exp.description.split("\n") if item.strip()
                ]
            experience_list.append(
                {
                    "company": exp.company or "",
                    "role": exp.role or "",
                    "start_date": f"{exp.start_month or ''} {exp.start_year or ''}".strip(),
                    "end_date": (
                        "Present"
                        if exp.currently_working
                        else f"{exp.end_month or ''} {exp.end_year or ''}".strip()
                    ),
                    "currently_working": bool(exp.currently_working),
                    "location": "",
                    "bullets": bullets,
                }
            )

        projects_list = []
        for proj in projects:
            projects_list.append(
                {
                    "title": proj.title or "",
                    "description": proj.description or "",
                    "technologies": (
                        [t.strip() for t in proj.tech_stack.split(",") if t.strip()]
                        if proj.tech_stack
                        else []
                    ),
                    "github_url": proj.github_url or "",
                    "live_url": proj.live_url or "",
                }
            )

        education_list = []
        for edu in education:
            education_list.append(
                {
                    "institution": edu.institution or "",
                    "degree": edu.degree or "",
                    "start_date": str(edu.start_year or ""),
                    "end_date": str(edu.end_year or ""),
                    "location": "",
                }
            )

        raw_canonical = {
            "contact": contact,
            "headline": headline,
            "summary": summary,
            "skills": skills_list,
            "experience": experience_list,
            "projects": projects_list,
            "education": education_list,
            "certifications": [],
            "achievements": [],
            "languages": [],
            "publications": [],
            "volunteer_experience": [],
        }

        from app.resume.services.resume_normalizer import (
            normalize_resume,
            get_canonical_hash,
            canonical_resume_to_text,
        )

        normalized = normalize_resume(raw_canonical)
        canonical_hash = get_canonical_hash(normalized)
        parsed_text = canonical_resume_to_text(normalized)

        from app.resume.services.resume_scoring_service import calculate_scores

        scores = calculate_scores(normalized)

        resume = Resume(
            user_id=user_id,
            title="Imported Profile",
            original_filename="profile_import.txt",
            file_path=f"profile_import_{uuid.uuid4()}.txt",
            parsed_text=parsed_text,
            resume_json=json.dumps(normalized),
            canonical_hash=canonical_hash,
            ats_score=scores["ats_score"],
            skills=",".join(normalized["skills"]),
            analysis_results=json.dumps(
                {
                    "ats_score": scores["ats_score"],
                    "matched_keywords": scores["matched_keywords"],
                    "missing_keywords": scores["missing_keywords"],
                    "suggestions": ["Add more details from your experiences"],
                    "heatmap": {
                        "contact_info": scores["formatting_score"],
                        "summary": scores["readability_score"],
                        "skills": scores["skills_coverage"],
                        "experience": scores["experience_quality"],
                        "projects": scores["projects_quality"],
                        "education": scores["education_quality"],
                    },
                }
            ),
        )

        try:
            ResumeRepository.create_resume(db, resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while importing profile.",
            )

        return {"message": "Profile imported successfully", "resume_id": resume.id}

    @staticmethod
    def update_resume(
        resume_id: int,
        payload: dict,
        db: Session,
        user_id: int,
    ) -> dict:
        resume = ResumeRepository.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

        if "title" in payload:
            resume.title = payload["title"]
        if "template" in payload:
            resume.template = payload["template"]
        if "version" in payload:
            resume.version = payload["version"]
        if "ats_score" in payload:
            resume.ats_score = payload["ats_score"]
        if "resume_json" in payload:
            resume.resume_json = json.dumps(payload["resume_json"])
            # Update skills list based on resume_json's skills
            skills_list = payload["resume_json"].get("skills", [])
            if skills_list:
                resume.skills = ",".join(skills_list)
            
            from app.resume.services.resume_normalizer import canonical_resume_to_text
            text_rep = canonical_resume_to_text(payload["resume_json"])
            resume.parsed_text = text_rep
            resume.canonical_hash = hashlib.sha256(text_rep.encode("utf-8")).hexdigest()

        try:
            db.commit()
            db.refresh(resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update resume.")

        return {"message": "Resume updated successfully", "resume_id": resume.id}
