from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.resume.services.resume_service import ResumeService

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ResumeService.upload_resume(file, db, current_user.id)


@router.post("/{resume_id}/active")
def set_active_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.set_active_resume(resume_id, db, current_user.id)


@router.get("")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.list_resumes(db, current_user.id)


@router.get("/active")
def get_active_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.get_active_resume(db, current_user.id)
