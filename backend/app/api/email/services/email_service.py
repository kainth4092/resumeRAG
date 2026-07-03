import logging
from typing import Optional
from ..providers.resend_provider import ResendEmailProvider
from app.core.config import settings


logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        api_key = settings.RESEND_API_KEY
        self.provider = ResendEmailProvider(api_key)

    def send_resume_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        attachment_path: Optional[str] = None,
        attachment_name: Optional[str] = None,
    ) -> dict:
        formatted_message = message.replace("\n", "<br>")
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="margin-bottom: 25px; font-size: 14px; color: #1e293b;">
                        {formatted_message}
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                    <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
                        This document was delivered securely via ResumeRAG AI application.
                    </p>
                </div>
            </body>
        </html>
        """

        return self.provider.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            cc=cc,
            bcc=bcc,
            attachment_path=attachment_path,
            attachment_name=attachment_name,
        )


email_service = EmailService()
