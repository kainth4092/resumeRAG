from pydantic import BaseModel
from typing import Optional


class EmailSendRequest(BaseModel):
    recipientEmail: str
    subject: str
    message: str
    resumeId: int
    templateId: Optional[str] = None
    cc: Optional[str] = None
    bcc: Optional[str] = None


class EmailSendResponse(BaseModel):
    success: bool
    message: str
    provider: str
    messageId: Optional[str] = None
