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
from app.resume.services.resume_scoring_service import calculate_scores

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

        from app.resume.services.resume_parsing_pipeline import parse_resume_pipeline
        from app.resume.services.resume_scoring_service import calculate_scores
        import re

        doc, parse_warnings = parse_resume_pipeline(parsed_text)
        scores = calculate_scores(doc)

        name = doc.contact.name.strip()
        if name:
            resume.title = name
        else:
            filename = resume.original_filename or ""
            cleaned = re.sub(r"^Optimized:\s*", "", filename, flags=re.IGNORECASE)
            cleaned = re.sub(r"\.(pdf|docx|doc)$", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"[_-]+", " ", cleaned)
            cleaned = re.sub(r"\bresume\b.*$", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            resume.title = cleaned or "Untitled Resume"

        resume.resume_json = doc.model_dump_json()
        resume.parse_warnings = json.dumps(parse_warnings) if parse_warnings else None
        resume.skills = ",".join(doc.skills)
        resume.ats_score = scores["ats_score"]

        resume.analysis_results = json.dumps(
            {
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
            }
        )
        resume.scoring_version = "v1"
        resume.prompt_version = "v1"
        resume.parsing_status = "completed"
        db.commit()

        from app.models.user_experience import UserExperience
        from app.services.profile_population_service import extract_and_populate_profile

        exp_count = (
            db.query(UserExperience).filter(UserExperience.user_id == user_id).count()
        )
        if exp_count == 0:
            extract_and_populate_profile(db, user_id, parsed_text)

        logger.info(f"[BG_PARSING] Successfully parsed resume id {resume_id}")
    except Exception as e:
        logger.exception(
            f"[BG_PARSING_FAILED] Failed to parse resume in background: {e}"
        )
        try:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                resume.parsing_status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


def _determine_source(r: Resume) -> str:
    if r.file_path == "generated" or r.is_generated:
        return "generated"
    if (r.original_filename or "").startswith("profile_import") or r.title == "Imported Profile":
        return "import"
    return "upload"


class ResumeService:
    @staticmethod
    async def upload_resume(
        file: UploadFile,
        db: Session,
        user_id: int,
        background_tasks: BackgroundTasks,
    ) -> dict:
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is required.",
            )

        file_ext = Path(file.filename).suffix.lower()
        allowed_file_types = {
            ".pdf": {
                "application/pdf",
                "application/x-pdf",
            },
            ".docx": {
                (
                    "application/vnd.openxmlformats-"
                    "officedocument.wordprocessingml.document"
                ),
                "application/zip",
                "application/octet-stream",
            },
        }

        allowed_content_types = allowed_file_types.get(
            file_ext,
        )

        if allowed_content_types is None:
            raise HTTPException(
                status_code=400,
                detail="Only valid PDF and DOCX files are allowed.",
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

        # Magic byte validation
        if file_ext == ".pdf":
            if not content.startswith(b"%PDF"):
                raise HTTPException(
                    status_code=400,
                    detail="File content does not match PDF format.",
                )
        elif file_ext == ".docx":
            if not content.startswith(b"PK"):
                raise HTTPException(
                    status_code=400,
                    detail="File content does not match DOCX format.",
                )
            import io
            import zipfile

            try:
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    if "word/document.xml" not in z.namelist():
                        raise HTTPException(
                            status_code=400,
                            detail="Invalid DOCX document archive structure.",
                        )
            except zipfile.BadZipFile:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid DOCX file archive.",
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
                if len(parsed_text.strip()) < 200:
                    raise HTTPException(
                        status_code=422,
                        detail=(
                            "The uploaded PDF contains fewer than 200 characters of readable text. "
                            "It may be scanned or empty. Please upload a text-based resume."
                        ),
                    )
            else:
                from app.services.docx_service import extract_text_from_docx

                parsed_text = extract_text_from_docx(str(temp_path))
                if len(parsed_text.strip()) < 50:
                    raise HTTPException(
                        status_code=422,
                        detail="The uploaded DOCX contains insufficient readable text.",
                    )
        except HTTPException:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            raise
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
                (Resume.content_hash == content_hash)
                | (Resume.canonical_hash == content_hash),
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
                content_hash=content_hash,
                parsing_status="completed",
                scoring_version=duplicate_resume.scoring_version,
                prompt_version=duplicate_resume.prompt_version,
                starred=False,
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
            content_hash=content_hash,
            parsing_status="pending",
            starred=False,
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
                "source": _determine_source(r),
                "starred": bool(r.starred),
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
                "parse_warnings": (
                    json.loads(r.parse_warnings) if r.parse_warnings else []
                ),
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
            "source": _determine_source(resume),
            "starred": bool(resume.starred),
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
            "resume_json": (
                json.loads(resume.resume_json) if resume.resume_json else None
            ),
            "parsing_status": resume.parsing_status or "completed",
            "parse_warnings": (
                json.loads(resume.parse_warnings) if resume.parse_warnings else []
            ),
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
    def save_generated_resume(
        payload: dict,
        db: Session,
        user_id: int,
    ) -> dict:
        from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text

        doc = to_resume_doc(payload["resume"])
        parsed_text = resume_doc_to_text(doc)
        canonical_hash = hashlib.sha256(parsed_text.encode("utf-8")).hexdigest()

        scores = calculate_scores(doc)

        resume = Resume(
            user_id=user_id,
            title=payload["title"],
            original_filename=f'{payload["title"]}.pdf',
            file_path="generated",
            parsed_text=parsed_text,
            is_active=False,
            ats_score=scores["ats_score"],
            skills=",".join(doc.skills),
            analysis_results=json.dumps(
                {
                    "ats_score": scores["ats_score"],
                    "matched_keywords": scores.get("matched_keywords", []),
                    "missing_keywords": scores.get("missing_keywords", []),
                    "suggestions": ["Include measurable achievements where possible."],
                    "heatmap": {
                        "contact_info": scores.get("formatting_score", 70),
                        "summary": scores.get("readability_score", 70),
                        "skills": scores.get("skills_coverage", 70),
                        "experience": scores.get("experience_quality", 70),
                        "projects": scores.get("projects_quality", 70),
                        "education": scores.get("education_quality", 70),
                    },
                }
            ),
            version="v1",
            template=payload["template"],
            is_generated=True,
            resume_json=doc.model_dump_json(),
            parsing_status="completed",
            canonical_hash=canonical_hash,
            content_hash=canonical_hash,
            scoring_version="v1",
            prompt_version="v1",
        )

        try:
            ResumeRepository.create_resume(db, resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Failed to save generated resume.",
            )

        return {
            "message": "Generated resume saved successfully.",
            "resume_id": resume.id,
        }

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

        if "title" in payload and payload["title"] is not None:
            resume.title = payload["title"]
        if "template" in payload and payload["template"] is not None:
            resume.template = payload["template"]
        if "starred" in payload and payload["starred"] is not None:
            resume.starred = bool(payload["starred"])

        # Note: ats_score and version from client are intentionally ignored (computed server-side)
        if "resume_json" in payload and payload["resume_json"] is not None:
            from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text
            from app.resume.services.resume_scoring_service import calculate_scores

            doc = to_resume_doc(payload["resume_json"])
            resume.resume_json = doc.model_dump_json()
            resume.skills = ",".join(doc.skills)
            text_representation = resume_doc_to_text(doc)
            resume.parsed_text = text_representation
            new_hash = hashlib.sha256(text_representation.encode("utf-8")).hexdigest()
            resume.canonical_hash = new_hash
            resume.content_hash = new_hash

            # Server-side ATS score recalculation
            scores = calculate_scores(doc)
            resume.ats_score = scores.get("ats_score", resume.ats_score)

            # Server-side version auto-increment
            current_v = resume.version or "v1"
            try:
                digits = "".join(filter(str.isdigit, current_v))
                num = int(digits) if digits else 1
                resume.version = f"v{num + 1}"
            except Exception:
                resume.version = "v2"

        try:
            db.commit()
            db.refresh(resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update resume.")

        return {
            "message": "Resume updated successfully.",
            "resume": {
                "id": resume.id,
                "title": resume.title,
                "template": resume.template,
                "version": resume.version,
                "ats_score": resume.ats_score,
                "starred": bool(resume.starred),
            },
        }

    @staticmethod
    def reparse_resume(
        resume_id: int,
        db: Session,
        user_id: int,
        background_tasks: BackgroundTasks | None = None,
    ) -> dict:
        resume = ResumeRepository.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")
        if not resume.parsed_text or not resume.parsed_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No extracted text available for this resume to reparse.",
            )

        if background_tasks:
            resume.parsing_status = "processing"
            db.commit()
            background_tasks.add_task(
                parse_resume_background_task,
                resume_id=resume.id,
                user_id=user_id,
                parsed_text=resume.parsed_text,
            )
            return {
                "message": "Resume reparsing queued in background.",
                "resume_id": resume.id,
                "parsing_status": "processing",
            }

        from app.resume.services.resume_parsing_pipeline import parse_resume_pipeline
        from app.resume.services.resume_scoring_service import calculate_scores

        doc, parse_warnings = parse_resume_pipeline(resume.parsed_text)
        scores = calculate_scores(doc)

        resume.resume_json = doc.model_dump_json()
        resume.parse_warnings = json.dumps(parse_warnings) if parse_warnings else None
        resume.skills = ",".join(doc.skills)
        resume.ats_score = scores.get("ats_score", resume.ats_score)
        resume.parsing_status = "completed"

        try:
            db.commit()
            db.refresh(resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to persist reparsed resume.")

        return {
            "message": "Resume reparsed successfully.",
            "resume_id": resume.id,
            "resume_json": doc.model_dump(),
            "parse_warnings": parse_warnings,
            "ats_score": resume.ats_score,
            "parsing_status": "completed",
        }

    @staticmethod
    def delete_resume(
        resume_id: int,
        db: Session,
        user_id: int,
    ) -> dict:
        resume = ResumeRepository.get_resume_by_id(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

        try:
            ResumeRepository.delete_resume(db, resume)
            db.commit()
        except SQLAlchemyError as e:
            db.rollback()
            logger.exception(f"Failed to delete resume {resume_id}: {e}")
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while deleting resume.",
            )

        return {
            "success": True,
            "message": "Resume deleted successfully",
            "resume_id": resume_id,
        }
