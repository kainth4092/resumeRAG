import os
import base64
import time
import tempfile
import logging
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.api.email.schemas import EmailSendResponse
from app.api.email.services import email_service
from app.resume.repository.resume_repository import ResumeRepository
from app.core.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/email", tags=["Email"])

# In-memory per-user rate limit tracker: user_id -> list of timestamps
_user_email_rate_limit: dict[int, list[float]] = defaultdict(list)


def _check_rate_limit(user_id: int):
    now = time.time()
    cutoff = now - 3600
    _user_email_rate_limit[user_id] = [
        t for t in _user_email_rate_limit[user_id] if t > cutoff
    ]
    if len(_user_email_rate_limit[user_id]) >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Email rate limit exceeded (maximum 10 emails per hour).",
        )
    _user_email_rate_limit[user_id].append(now)


@router.post("/send", response_model=EmailSendResponse)
@limiter.limit("5/minute")
async def send_email(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _check_rate_limit(current_user.id)

    content_type = request.headers.get("content-type", "")
    pdf_bytes = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        recipient_email = str(
            form.get("recipientEmail") or form.get("recipient_email") or ""
        ).strip()
        subject = str(form.get("subject") or "").strip()
        message = str(form.get("message") or "").strip()
        cc = str(form.get("cc") or "").strip()
        bcc = str(form.get("bcc") or "").strip()
        resume_id_raw = form.get("resumeId") or form.get("resume_id")
        try:
            resume_id = int(resume_id_raw)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid resume ID provided.",
            )

        pdf_file = form.get("pdf_file")
        if pdf_file and hasattr(pdf_file, "read"):
            pdf_bytes = await pdf_file.read()
    else:
        body = await request.json()
        recipient_email = str(
            body.get("recipientEmail") or body.get("recipient_email") or ""
        ).strip()
        subject = str(body.get("subject") or "").strip()
        message = str(body.get("message") or "").strip()
        cc = str(body.get("cc") or "").strip()
        bcc = str(body.get("bcc") or "").strip()
        try:
            resume_id = int(body.get("resumeId") or body.get("resume_id"))
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid resume ID provided.",
            )

    if not recipient_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipient email address is required.",
        )
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email subject is required.",
        )

    # Validate recipient count (cap <= 5 total)
    all_recipients = [recipient_email]
    if cc:
        all_recipients.extend([c.strip() for c in cc.split(",") if c.strip()])
    if bcc:
        all_recipients.extend([b.strip() for b in bcc.split(",") if b.strip()])
    if len(all_recipients) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot exceed 5 recipients total (including CC and BCC).",
        )

    resume = ResumeRepository.get_resume_by_id(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume document not found or you are not authorized to access it.",
        )

    attachment_path = None
    attachment_created = False

    if pdf_bytes is not None:
        if len(pdf_bytes) > 2 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF attachment must not exceed 2 MB.",
            )
        if not pdf_bytes.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attachment must be a valid PDF document.",
            )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(pdf_bytes)
            attachment_path = tmp.name
            attachment_created = True
    elif resume.file_content_base64:
        try:
            content = base64.b64decode(resume.file_content_base64, validate=True)
            if not content.startswith(b"%PDF"):
                raise ValueError("Not PDF magic bytes")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(content)
                attachment_path = tmp.name
                attachment_created = True
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The stored resume attachment is corrupted or unreadable.",
            )
    elif resume.file_path and os.path.exists(resume.file_path):
        attachment_path = resume.file_path
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a rendered PDF file attachment for this resume.",
        )

    try:
        result = email_service.send_resume_email(
            to_email=recipient_email,
            subject=subject,
            message=message,
            cc=cc,
            bcc=bcc,
            attachment_path=attachment_path,
            attachment_name=f"{resume.title or 'Resume'}.pdf",
        )
        logger.info(
            "Email dispatch succeeded user_id=%s message_id=%s provider=%s",
            current_user.id,
            result.get("id"),
            result.get("provider"),
        )
        return EmailSendResponse(
            success=True,
            message="Resume email delivered successfully.",
            provider=result.get("provider", "Unknown"),
            messageId=result.get("id"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Email dispatch failed user_id=%s", current_user.id)
        error_message = str(exc)
        if "403" in error_message:
            detail = (
                "Email delivery was rejected by Resend. "
                "Verify your sending domain or send only to your verified email address while testing."
            )
        elif "401" in error_message:
            detail = "Resend authentication failed. Check RESEND_API_KEY."
        elif "429" in error_message:
            detail = "Email rate limit exceeded. Please try again shortly."
        else:
            detail = "Email dispatch failed. Please try again."

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        ) from exc
    finally:
        if attachment_created and attachment_path and os.path.exists(attachment_path):
            try:
                os.remove(attachment_path)
            except OSError:
                pass
