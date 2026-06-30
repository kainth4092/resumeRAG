import base64
import os
import requests
import time
from typing import Optional
from .base import BaseEmailProvider


class ResendEmailProvider(BaseEmailProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.is_mock = not api_key or "YOUR_API" in api_key or api_key == "placeholder"

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        attachment_path: Optional[str] = None,
        attachment_name: Optional[str] = None,
    ) -> dict:
        print(f"[Resend Provider] Dispatching to {to_email} (mock={self.is_mock})...")

        cc_list = (
            [email.strip() for email in cc.split(",") if email.strip()] if cc else []
        )
        bcc_list = (
            [email.strip() for email in bcc.split(",") if email.strip()] if bcc else []
        )

        attachments = []
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                encoded_file = base64.b64encode(f.read()).decode("utf-8")
            attachments.append(
                {
                    "content": encoded_file,
                    "filename": attachment_name or os.path.basename(attachment_path),
                }
            )

        if self.is_mock:
            time.sleep(1.2)
            if "fail" in to_email.lower() or "error" in to_email.lower():
                raise Exception(
                    "Simulated Resend API delivery error: Invalid recipient credentials."
                )
            return {
                "success": True,
                "id": f"mock_resend_{int(time.time())}",
                "provider": "Resend (Mock)",
            }

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        from_address = os.getenv("EMAIL_FROM_ADDRESS", "onboarding@resend.dev")

        payload = {
            "from": from_address,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        if cc_list:
            payload["cc"] = cc_list
        if bcc_list:
            payload["bcc"] = bcc_list
        if attachments:
            payload["attachments"] = attachments

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code not in (200, 201):
                raise Exception(
                    f"Resend HTTP API failed with status {response.status_code}: {response.text}"
                )

            data = response.json()
            return {"success": True, "id": data.get("id"), "provider": "Resend"}
        except Exception as e:
            print(f"[Resend Provider] Delivery failure: {e}")
            raise e
