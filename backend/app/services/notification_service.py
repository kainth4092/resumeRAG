from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user_settings import UserSettings


NOTIFICATION_PREFERENCE_MAP = {
    "job": "job_alerts",
    "interview": "interview_alerts",
    "roadmap": "roadmap_updates",
    "product": "product_updates",
}


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general",
    action_url: str | None = None,
) -> Notification | None:
    """
    Create a notification only if the user's corresponding
    notification preference is enabled.
    """

    preference_field = NOTIFICATION_PREFERENCE_MAP.get(notification_type.lower())

    if preference_field:
        user_settings = (
            db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        )

        if user_settings:
            is_enabled = getattr(
                user_settings,
                preference_field,
                True,
            )

            if not is_enabled:
                return None

        elif preference_field == "product_updates":
            return None

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification
