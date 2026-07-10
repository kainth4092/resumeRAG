from pydantic import BaseModel, ConfigDict


class NotificationSettingsUpdate(BaseModel):
    email_notifications: bool
    weekly_digest: bool
    job_alerts: bool
    interview_alerts: bool
    roadmap_updates: bool
    product_updates: bool


class NotificationSettingsResponse(NotificationSettingsUpdate):
    model_config = ConfigDict(from_attributes=True)


class PrivacySettingsUpdate(BaseModel):
    share_analytics: bool
    personalize_jobs: bool


class PrivacySettingsResponse(PrivacySettingsUpdate):
    model_config = ConfigDict(from_attributes=True)
