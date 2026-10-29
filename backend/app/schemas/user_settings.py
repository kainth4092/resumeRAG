from pydantic import BaseModel, ConfigDict


class NotificationSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    interview_alerts: bool = True
    roadmap_updates: bool = True
    product_updates: bool = False


class NotificationSettingsResponse(NotificationSettingsUpdate):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class PrivacySettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")


class PrivacySettingsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    export_available: bool = True
    data_retention_days: int = 30
