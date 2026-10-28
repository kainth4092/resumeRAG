from pydantic import BaseModel, EmailStr, Field, field_validator
from app.utils.password_validator import validate_password


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty.")

        return value

    @field_validator("password")
    @classmethod
    def validate_user_password(cls, value: str):
        validate_password(value)
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class GoogleLoginRequest(BaseModel):
    credential: str


class AccountUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=150)
    headline: str | None = Field(default=None, max_length=150)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str):
        validate_password(value)
        return value


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=128)
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str):
        validate_password(value)
        return value

