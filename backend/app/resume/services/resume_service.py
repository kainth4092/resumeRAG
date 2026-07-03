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

        return {"message": "Resume uploaded", "resume_id": resume.id}

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
