from typing import Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
)


class EmailSendRequest(BaseModel):
    recipientEmail: EmailStr

    @field_validator(
        "recipientEmail",
        mode="before",
    )
    @classmethod
    def clean_recipient_email(
        cls,
        value,
    ):
        if isinstance(
            value,
            str,
        ):
            return value.strip()

        return value

    subject: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    message: str = Field(
        ...,
        min_length=1,
        max_length=20000,
    )

    resumeId: int = Field(
        ...,
        gt=0,
    )

    templateId: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    cc: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    bcc: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    @field_validator(
        "subject",
        "message",
    )
    @classmethod
    def clean_required_text(
        cls,
        value: str,
    ) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError(
                "This field cannot be empty."
            )

        return cleaned

    @field_validator(
        "templateId",
    )
    @classmethod
    def clean_optional_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None

    @field_validator(
        "cc",
        "bcc",
    )
    @classmethod
    def validate_email_list(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        raw_emails = [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

        if not raw_emails:
            return None

        if len(raw_emails) > 20:
            raise ValueError(
                "A maximum of 20 email "
                "addresses is allowed."
            )

        validated = []

        for email in raw_emails:
            try:
                validated_email = (
                    EmailStr._validate(
                        email
                    )
                )
            except Exception as exc:
                raise ValueError(
                    "Enter valid comma-separated "
                    "email addresses."
                ) from exc

            validated.append(
                str(validated_email)
            )

        return ", ".join(
            validated
        )


class EmailSendResponse(BaseModel):
    success: bool
    message: str
    provider: str
    messageId: Optional[str] = None
