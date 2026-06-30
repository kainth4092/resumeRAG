from abc import ABC, abstractmethod
from typing import Optional


class BaseEmailProvider(ABC):
    @abstractmethod
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
        """
        Send an email message with attachments.
        Returns a dict containing 'success', 'id', and 'provider'.
        """
        pass
