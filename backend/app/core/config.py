from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_csv(value: str) -> list[str]:
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "google/gemma-4-31b-it:free"
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
    WHISPER_MODEL_SIZE: str = "base"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "float32"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        origins = []

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
                    "http://localhost:3000",
                    "http://localhost:4173",
                    "http://localhost:5173",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:4173",
                    "http://127.0.0.1:5173",
                ]
            )
        return list(dict.fromkeys(origins))


settings = Settings()
