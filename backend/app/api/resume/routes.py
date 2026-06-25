from pathlib import Path
import uuid
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
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
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
        parsed_text = extract_text_from_pdf(str(save_path))
    except Exception:
        if save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=400, detail="Unable to read PDF.")

    resume = Resume(
        user_id=current_user.id,
        title=file.filename,
        original_filename=file.filename,
        file_path=str(save_path),
        parsed_text=parsed_text,
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
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    db.query(Resume).filter(Resume.user_id == current_user.id).update({Resume.is_active: False})
    resume.is_active = True
    
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update active status.")
        
    return {"message": "Resume set as active", "resume_id": resume.id}


@router.get("/active")
def get_active_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    if not resume:
        return {"active_resume_id": None}
    return {
        "active_resume_id": resume.id,
        "title": resume.title,
        "original_filename": resume.original_filename,
    }

