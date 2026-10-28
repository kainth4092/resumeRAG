from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "openrouter/free"
    AI_PROVIDER: str = "openrouter"
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    EMAIL_FROM_ADDRESS: str = "onboarding@resend.dev"
    FRONTEND_URL: str = ""
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    UPLOAD_DIR: str = "uploads/tmp"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024
    OLLAMA_BASE_URL: str = ""
    OLLAMA_MODEL: str = "gemma2:2b"
    RAPIDAPI_KEY: str = ""
    RAPIDAPI_HOST: str = ""
    FEATURE_VOICE_INTERVIEW: bool = False
    WHISPER_MODEL_SIZE: str = "base"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "float32"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            if len(self.JWT_SECRET) < 32:
                raise ValueError(
                    "JWT_SECRET must be at least 32 characters in production."
                )
        return self

    @property
    def cors_origins(self) -> list[str]:
        origins: list[str] = []

        if self.FRONTEND_URL:
            origins.extend(
                [
                    origin.strip().rstrip("/")
                    for origin in self.FRONTEND_URL.split(",")
                    if origin.strip()
                ]
            )

        if self.ENVIRONMENT.lower() != "production":
            origins.extend(
                [
                    "http://localhost:5173",
                    "http://localhost:4173",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:4173",
                ]
            )

        return list(dict.fromkeys(origins))

    @property
    def db_url(self) -> str:
        return self.DATABASE_URL


settings = Settings()
