from datetime import datetime, timezone, timedelta
import hashlib
import logging
import secrets
import time
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.auth import PasswordResetToken, EmailVerificationToken, RefreshToken
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    MessageResponse,
    GoogleLoginRequest,
    AccountUpdateRequest,
    PasswordChangeRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.api.email.services.email_service import email_service
from app.core.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _create_and_set_refresh_token(
    response: Response, user_id: int, db: Session, remember_me: bool = False
) -> str:
    raw_token = secrets.token_urlsafe(32)
    tok_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    days = settings.REFRESH_TOKEN_EXPIRE_DAYS if remember_me else 7
    expires_at = datetime.now(timezone.utc) + timedelta(days=days)

    rec = RefreshToken(
        user_id=user_id,
        token_hash=tok_hash,
        expires_at=expires_at,
    )
    db.add(rec)
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value=raw_token,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        max_age=days * 86400,
        path="/api/auth",
    )
    return raw_token


@router.post(
    "/register", status_code=status.HTTP_200_OK, response_model=MessageResponse
)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()

    # Generic response: never reveal whether an email exists (prevents account enumeration)
    if not existing_user:
        user = User(
            name=payload.name,
            email=clean_email,
            password_hash=hash_password(payload.password),
            provider="local",
            email_verified=False,
            token_version=1,
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)

            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
            verification_rec = EmailVerificationToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
            )
            db.add(verification_rec)
            db.commit()

            base_frontend = (
                settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
                if settings.FRONTEND_URL
                else "http://localhost:5173"
            )
            verify_url = f"{base_frontend}/verify-email?token={raw_token}"
            try:
                email_service.send_resume_email(
                    to_email=user.email,
                    subject="Verify your ResuPilot AI email address",
                    message=(
                        f"Hi {user.name},\n\n"
                        f"Thank you for registering with ResuPilot AI. Please verify your email by clicking the link below:\n\n"
                        f"{verify_url}\n\n"
                        f"This link expires in 24 hours. If you did not create this account, you can ignore this email."
                    ),
                )
            except Exception as exc:
                logger.warning("Failed to send verification email to %s: %s", clean_email, exc)

        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Database error occurred.")

    return {
        "message": "Registration received. If this email is not yet registered, verification instructions have been sent."
    }


@router.get("/verify-email", response_model=MessageResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    if not token or not token.strip():
        raise HTTPException(status_code=400, detail="Missing verification token.")

    token_hash = hashlib.sha256(token.strip().encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    rec = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > now,
        )
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired email verification token.",
        )

    user = db.query(User).filter(User.id == rec.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.email_verified = True
    rec.used_at = now
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to verify email.")

    return {"message": "Email verified successfully. You may now log in."}


@router.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/minute")
def resend_verification(
    request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    # Never reveal whether an unverified email exists
    if user and not user.email_verified and user.provider == "local":
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        rec = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        )
        db.add(rec)
        db.commit()

        base_frontend = (
            settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
            if settings.FRONTEND_URL
            else "http://localhost:5173"
        )
        verify_url = f"{base_frontend}/verify-email?token={raw_token}"
        try:
            email_service.send_resume_email(
                to_email=user.email,
                subject="Verify your ResuPilot AI email address",
                message=(
                    f"Hi {user.name},\n\n"
                    f"Please verify your email address by clicking the link below:\n\n"
                    f"{verify_url}\n\n"
                    f"This link expires in 24 hours."
                ),
            )
        except Exception as exc:
            logger.warning("Resend verification email failed for %s: %s", clean_email, exc)

    return {
        "message": "If an unverified account exists for this email, verification instructions have been resent."
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        {"sub": str(user.id), "ver": user.token_version},
        expires_delta=expires_delta,
    )
    _create_and_set_refresh_token(
        response, user.id, db, remember_me=bool(payload.remember_me)
    )
    return {"access_token": token, "token_type": "bearer"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_tok = request.cookies.get("refresh_token")
    if not refresh_tok:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_tok = auth_header.split(" ")[1]

    if not refresh_tok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing.",
        )

    tok_hash = hashlib.sha256(refresh_tok.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    rec = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == tok_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token.",
        )

    user = db.query(User).filter(User.id == rec.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    # Issue new short-lived access token
    access_token = create_access_token(
        {"sub": str(user.id), "ver": user.token_version},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Rotate refresh token
    rec.revoked_at = now
    new_raw_token = secrets.token_urlsafe(32)
    new_hash = hashlib.sha256(new_raw_token.encode("utf-8")).hexdigest()
    new_rec = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_rec)
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value=new_raw_token,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth",
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    refresh_tok = request.cookies.get("refresh_token")
    if refresh_tok:
        tok_hash = hashlib.sha256(refresh_tok.encode("utf-8")).hexdigest()
        rec = db.query(RefreshToken).filter(RefreshToken.token_hash == tok_hash).first()
        if rec:
            rec.revoked_at = datetime.now(timezone.utc)
            db.commit()

    response.delete_cookie(key="refresh_token", path="/api/auth")
    return {"message": "Logged out successfully."}


@router.post("/logout-all", response_model=MessageResponse)
def logout_all(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Invalidate all existing tokens globally by bumping token_version
    current_user.token_version += 1
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked_at.is_(None),
    ).update({"revoked_at": now})
    db.commit()

    response.delete_cookie(key="refresh_token", path="/api/auth")
    return {"message": "All sessions have been revoked."}


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
def google_auth(
    request: Request,
    response: Response,
    payload: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    token = payload.credential
    if not token or token.count(".") != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credential format: Google ID token (JWT) required.",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            audience=settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google ID token: {str(e)}",
        )

    # 1. Verify issuer
    if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token issuer.",
        )

    # 2. Verify audience matches client ID
    if idinfo.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token audience.",
        )

    # 3. Verify expiration
    exp = idinfo.get("exp")
    if exp and exp < time.time():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google ID token has expired.",
        )

    # 4. Verify email is verified
    email_verified = idinfo.get("email_verified", False)
    if isinstance(email_verified, str):
        email_verified = email_verified.lower() == "true"
    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Google account email is not verified.",
        )

    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token does not contain required user identity.",
        )

    clean_email = email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if user:
        updated = False
        if not user.provider_id:
            user.provider_id = google_id
            updated = True
        if not user.provider or user.provider == "local":
            user.provider = "google"
            updated = True
        if picture and not user.avatar_url:
            user.avatar_url = picture
            updated = True
        if not user.email_verified:
            user.email_verified = True
            updated = True

        if updated:
            try:
                db.commit()
                db.refresh(user)
            except SQLAlchemyError:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to link Google account.")
    else:
        user = User(
            name=name or clean_email.split("@")[0],
            email=clean_email,
            password_hash=None,
            provider="google",
            provider_id=google_id,
            avatar_url=picture,
            email_verified=True,
            token_version=1,
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to create user with Google account.")

    jwt_token = create_access_token({"sub": str(user.id), "ver": user.token_version})
    _create_and_set_refresh_token(response, user.id, db, remember_me=True)
    return {"access_token": jwt_token, "token_type": "bearer"}


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "email_verified": current_user.email_verified,
        "onboarded": profile is not None,
        "profile": {
            "phone": profile.phone if profile else "",
            "location": profile.location if profile else "",
            "headline": profile.headline if profile else "",
        } if profile else None,
    }


@router.put("/settings/account")
def update_settings_account(
    payload: AccountUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email != current_user.email:
        conflict = db.query(User).filter(User.email == payload.email).first()
        if conflict:
            raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = payload.email

    current_user.name = payload.name

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = payload.name
    profile.phone = payload.phone
    profile.location = payload.location
    profile.headline = payload.headline

    try:
        db.commit()
        db.refresh(current_user)
        db.refresh(profile)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save settings")

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "profile": {
            "phone": profile.phone,
            "location": profile.location,
            "headline": profile.headline,
        },
    }


@router.put("/settings/password")
def update_settings_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="Social login users cannot change passwords.")

    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid current password.")

    current_user.password_hash = hash_password(payload.new_password)
    # Bump token_version on password change to invalidate all active JWTs on other devices
    current_user.token_version += 1

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database update failed.")
    return {"message": "Password updated successfully"}


@router.delete("/settings/account")
def delete_settings_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.api.account.routes import delete_user_account_endpoint
    return delete_user_account_endpoint(db=db, current_user=current_user)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
def forgot_password(
    request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user:
        # Avoid user enumeration
        return {"message": "If this email is registered, password reset instructions have been sent."}

    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    recent_count = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at >= one_hour_ago,
        )
        .count()
    )
    if recent_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset attempts. Please try again later.",
        )

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()

    base_frontend = (
        settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
        if settings.FRONTEND_URL
        else "http://localhost:5173"
    )
    reset_link = f"{base_frontend}/reset-password?token={raw_token}"
    email_body = (
        f"Hi {user.name or 'there'},\n\n"
        f"We received a request to reset your ResuPilot password. Click the link below to set a new password:\n\n"
        f"{reset_link}\n\n"
        f"This link will expire in 30 minutes. If you did not request this, you can safely ignore this email."
    )
    try:
        email_service.send_resume_email(
            to_email=user.email,
            subject="Reset your ResuPilot password",
            message=email_body,
        )
    except Exception as exc:
        logger.warning("Failed to send password reset email to user_id=%s: %s", user.id, exc)

    return {"message": "If this email is registered, password reset instructions have been sent."}


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
def reset_password(
    request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)
):
    token_hash = hashlib.sha256(payload.token.strip().encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    reset_record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .first()
    )
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(payload.new_password)
    # Bump token_version on password reset to invalidate previous JWTs
    user.token_version += 1
    reset_record.used_at = now

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset password.")

    return {"message": "Password reset successfully. You may now log in with your new password."}
