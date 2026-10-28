from datetime import datetime, timezone, timedelta
import hashlib
import json
import logging
import secrets
import urllib.request
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.auth import PasswordResetToken
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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register", status_code=status.HTTP_201_CREATED, response_model=MessageResponse
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already exists")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        provider="local",
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")

    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    expires_delta = (
        timedelta(days=30)
        if payload.remember_me
        else None
    )
    token = create_access_token({"sub": str(user.id)}, expires_delta=expires_delta)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    token = payload.credential
    is_id_token = len(token.split(".")) == 3
    
    if is_id_token:
        try:
            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Verify issuer
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Wrong issuer.")
                
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google ID token: {str(e)}"
            )
    else:
        # Verify the Google access token
        try:
            req = urllib.request.Request(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                idinfo = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google access token: {str(e)}"
            )
        
    google_id = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    email_verified = idinfo.get(
        "email_verified",
        False,
    )

    if isinstance(
        email_verified,
        str,
    ):
        email_verified = (
            email_verified.lower()
            == "true"
        )

    if not google_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Google token does not contain "
                "a valid subject."
            ),
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Google token does not contain "
                "email address."
            ),
        )

    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Google email address is not "
                "verified."
            ),
        )
        
    # Check if the user already exists by email
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Link Google account to existing user if not already linked
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
            
        if updated:
            try:
                db.commit()
                db.refresh(user)
            except SQLAlchemyError:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to link Google account.")
    else:
        # Create a new user
        user = User(
            name=name or email.split("@")[0],
            email=email,
            password_hash=None,
            provider="google",
            provider_id=google_id,
            avatar_url=picture,
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to create user with Google account.")
            
    # Generate application JWT
    jwt_token = create_access_token({"sub": str(user.id)})
    return {"access_token": jwt_token, "token_type": "bearer"}


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "onboarded": profile is not None,
        "profile": {
            "phone": profile.phone if profile else "",
            "location": profile.location if profile else "",
            "headline": profile.headline if profile else "",
        } if profile else None
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
        }
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
    try:
        db.delete(current_user)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete account.")
    return {"message": "Account deleted successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user:
        # Avoid user enumeration
        return {"message": "If this email is registered, password reset instructions have been sent."}

    # Rate limiting: max 3 reset requests per hour per user
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

    base_frontend = settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
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
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
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
    reset_record.used_at = now

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset password.")

    return {"message": "Password reset successfully. You may now log in with your new password."}


