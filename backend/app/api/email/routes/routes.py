import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.api.email.schemas import EmailSendRequest, EmailSendResponse
from app.api.email.services import email_service
from app.resume.repository.resume_repository import ResumeRepository

router = APIRouter(prefix="/api/email", tags=["Email"])


@router.post("/send", response_model=EmailSendResponse)
def send_email(
    request: EmailSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = ResumeRepository.get_resume_by_id(db, request.resumeId, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume document not found or you are not authorized to access it.",
        )
    if not resume.file_path or not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The physical resume attachment could not be located on the server.",
        )

    try:
        result = email_service.send_resume_email(
            to_email=request.recipientEmail,
            subject=request.subject,
            message=request.message,
            cc=request.cc,
            bcc=request.bcc,
            attachment_path=resume.file_path,
            attachment_name=resume.original_filename,
        )
        return EmailSendResponse(
            success=True,
            message="Resume email delivered successfully.",
            provider=result.get("provider", "Unknown"),
            messageId=result.get("id"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email dispatch failed: {str(e)}",
        )
