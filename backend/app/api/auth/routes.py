from datetime import timedelta
import json
import urllib.request
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    MessageResponse,
    GoogleLoginRequest,
    AccountUpdateRequest,
    PasswordChangeRequest,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings

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
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    expires_delta = timedelta(days=30) if payload.remember_me else None
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
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token does not contain email address."
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

