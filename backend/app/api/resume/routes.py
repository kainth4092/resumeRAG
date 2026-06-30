from pathlib import Path
import uuid
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services.pdf_service import extract_text_from_pdf


router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    upload_dir = Path("uploads/resumes")
    upload_dir.mkdir(parents=True, exist_ok=True)
    save_path = upload_dir / unique_name

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    MAX_SIZE = 5 * 1024 * 1024

    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size must not exceed 5 MB.")

    with open(save_path, "wb") as f:
        f.write(content)
    try:
        if file_ext == ".pdf":
            parsed_text = extract_text_from_pdf(str(save_path))
        else:
            from app.services.docx_service import extract_text_from_docx

            parsed_text = extract_text_from_docx(str(save_path))
    except Exception:
        if save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=400, detail="Unable to read PDF or DOCX file.")

    resume = Resume(
        user_id=current_user.id,
        title=file.filename,
        original_filename=file.filename,
        file_path=str(save_path),
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
        db.add(resume)
        db.commit()
        db.refresh(resume)

    except SQLAlchemyError:
        db.rollback()
        if save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=500, detail="Database error occurred.")

    return {"message": "Resume uploaded", "resume_id": resume.id}


@router.post("/{resume_id}/active")
def set_active_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    db.query(Resume).filter(Resume.user_id == current_user.id).update(
        {Resume.is_active: False}
    )
    resume.is_active = True

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update active status.")

    return {"message": "Resume set as active", "resume_id": resume.id}


@router.get("")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )
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


@router.get("/active")
def get_active_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_active == True)
        .first()
    )
    if not resume:
        return {"active_resume_id": None}
    return {
        "active_resume_id": resume.id,
        "title": resume.title,
        "original_filename": resume.original_filename,
    }
