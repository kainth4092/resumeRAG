import base64
import json
import logging
import tempfile
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.models.resume import Resume
from app.resume.repository.resume_repository import ResumeRepository
from app.services.pdf_service import extract_text_from_pdf


logger = logging.getLogger(__name__)

class ResumeService:
    @staticmethod
    async def upload_resume(
        file: UploadFile,
        db: Session,
        user_id: int,
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
            raise HTTPException(status_code=400, detail="File size must not exceed 5 MB.")

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, dir=upload_dir, suffix=suffix) as temp_file:
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
            raise HTTPException(status_code=400, detail="Unable to read PDF or DOCX file.")
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

        resume = Resume(
            user_id=user_id,
            title=file.filename,
            original_filename=file.filename,
            file_path=unique_name,
            file_content_base64=base64.b64encode(content).decode("utf-8"),
            parsed_text=parsed_text,
            ats_score=75,
            skills="React,JavaScript,HTML,CSS,SQL",
            analysis_results=json.dumps({
                "ats_score": 75,
                "matched_keywords": ["React", "JavaScript", "HTML", "CSS", "SQL"],
                "missing_keywords": ["TypeScript", "AWS", "Docker", "CI/CD"],
                "suggestions": [
                    "Include specific metrics (e.g. 'improved performance by 20%')",
                    "Add details about cloud deployment (AWS/GCP)",
                    "Strengthen your professional summary by aligning with target roles",
                    "List individual Docker/CI/CD tool integrations",
                    "Format project sections with clear technology listings"
                ],
                "heatmap": {
                    "contact_info": 95,
                    "summary": 70,
                    "skills": 80,
                    "experience": 72,
                    "projects": 65,
                    "education": 90
                }
            }),
            version="v1",
            template="Professional",
        )
        try:
            ResumeRepository.create_resume(db, resume)
        except SQLAlchemyError:
            db.rollback()
            if temp_path and temp_path.exists():
                temp_path.unlink()
            raise HTTPException(status_code=500, detail="Database error occurred.")

        # Check if the user has any experience entries in the database to detect first-time/empty profile.
        from app.models.user_experience import UserExperience
        profile_extracted = False
        try:
            exp_count = db.query(UserExperience).filter(UserExperience.user_id == user_id).count()
            if exp_count == 0:
                from app.services.profile_population_service import extract_and_populate_profile
                extract_and_populate_profile(db, user_id, parsed_text)
                profile_extracted = True
        except Exception as e:
            logger.error(f"Failed to auto-populate profile on resume upload: {e}")

        return {"message": "Resume uploaded", "resume_id": resume.id, "profile_extracted": profile_extracted}

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
            raise HTTPException(status_code=500, detail="Failed to update active status.")

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
                "skills": [s.strip() for s in r.skills.split(",") if s.strip()] if r.skills else [],
                "analysis_results": json.loads(r.analysis_results) if r.analysis_results else None,
                "version": r.version or "v1",
                "template": r.template or "Professional",
                "resume_json": json.loads(r.resume_json) if r.resume_json else None,
            }
            for r in resumes
        ]

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
        experiences = db.query(UserExperience).filter(UserExperience.user_id == user_id).all()
        education = db.query(UserEducation).filter(UserEducation.user_id == user_id).all()

        if not profile and not skills and not projects and not experiences and not education:
            raise HTTPException(
                status_code=400,
                detail="Profile is completely empty. Please enter your profile information first."
            )

        lines = []
        if profile:
            lines.append(f"Name: {profile.full_name or ''}")
            lines.append(f"Headline: {profile.headline or ''}")
            lines.append(f"Phone: {profile.phone or ''}")
            lines.append(f"Location: {profile.location or ''}")
            lines.append(f"LinkedIn: {profile.linkedin_url or ''}")
            lines.append(f"GitHub: {profile.github_url or ''}")
            lines.append(f"Portfolio: {profile.portfolio_url or ''}")
            lines.append(f"Summary: {profile.summary or ''}")
            lines.append("")

        if skills:
            lines.append("Skills:")
            lines.append(", ".join([s.skill_name for s in skills]))
            lines.append("")

        if experiences:
            lines.append("Experience:")
            for exp in experiences:
                lines.append(f"Company: {exp.company}")
                lines.append(f"Role: {exp.role}")
                lines.append(f"Duration: {exp.start_month or ''} {exp.start_year or ''} - {exp.end_month or 'Present' if exp.currently_working else exp.end_year or ''}")
                lines.append(f"Description: {exp.description or ''}")
                lines.append("")

        if projects:
            lines.append("Projects:")
            for proj in projects:
                lines.append(f"Title: {proj.title}")
                lines.append(f"Technologies: {proj.tech_stack or ''}")
                lines.append(f"Description: {proj.description}")
                if proj.github_url:
                    lines.append(f"GitHub: {proj.github_url}")
                if proj.live_url:
                    lines.append(f"Live: {proj.live_url}")
                lines.append("")

        if education:
            lines.append("Education:")
            for edu in education:
                lines.append(f"Institution: {edu.institution}")
                lines.append(f"Degree: {edu.degree}")
                lines.append(f"Duration: {edu.start_year or ''} - {edu.end_year or ''}")
                lines.append("")

        parsed_text = "\n".join(lines)

        resume = Resume(
            user_id=user_id,
            title="Imported Profile",
            original_filename="profile_import.txt",
            file_path=f"profile_import_{uuid.uuid4()}.txt",
            parsed_text=parsed_text,
            skills=",".join([s.skill_name for s in skills]) if skills else "",
            ats_score=75,
            analysis_results=json.dumps({
                "ats_score": 75,
                "matched_keywords": [s.skill_name for s in skills][:5] if skills else [],
                "missing_keywords": [],
                "suggestions": ["Add more details from your experiences"],
                "heatmap": {
                    "contact_info": 90,
                    "summary": 80,
                    "skills": 80,
                    "experience": 70,
                    "projects": 70,
                    "education": 80
                }
            })
        )

        try:
            ResumeRepository.create_resume(db, resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Database error occurred while importing profile.")

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

        try:
            db.commit()
            db.refresh(resume)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to update resume.")

        return {"message": "Resume updated successfully", "resume_id": resume.id}
