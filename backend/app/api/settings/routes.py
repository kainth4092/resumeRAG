from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_settings import UserSettings
from app.schemas.user_settings import (
    NotificationSettingsResponse,
    NotificationSettingsUpdate,
    PrivacySettingsResponse,
    PrivacySettingsUpdate,
)

router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


def get_or_create_settings(
    db: Session,
    user_id: int,
) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    if settings:
        return settings

    settings = UserSettings(user_id=user_id)

    try:
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize user settings.",
        ) from exc


@router.get(
    "/notifications",
    response_model=NotificationSettingsResponse,
)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_settings(
        db=db,
        user_id=current_user.id,
    )


@router.put(
    "/notifications",
    response_model=NotificationSettingsResponse,
)
def update_notification_settings(
    payload: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = get_or_create_settings(
        db=db,
        user_id=current_user.id,
    )

    for field, value in payload.model_dump().items():
        setattr(settings, field, value)

    try:
        db.commit()
        db.refresh(settings)
        return settings

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save notification settings.",
        ) from exc


@router.get(
    "/privacy",
    response_model=PrivacySettingsResponse,
)
def get_privacy_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_settings(
        db=db,
        user_id=current_user.id,
    )


@router.put(
    "/privacy",
    response_model=PrivacySettingsResponse,
)
def update_privacy_settings(
    payload: PrivacySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = get_or_create_settings(
        db=db,
        user_id=current_user.id,
    )

    settings.share_analytics = payload.share_analytics
    settings.personalize_jobs = payload.personalize_jobs

    try:
        db.commit()
        db.refresh(settings)
        return settings

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save privacy settings.",
        ) from exc
