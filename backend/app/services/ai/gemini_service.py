import logging
from app.services.ai.base import AIProvider, AIProviderException

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    def __init__(self):
        logger.info("Initializing Gemini Provider stub")

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        raise AIProviderException(
            "Gemini Provider is not fully implemented yet.", status_code=501
        )

    async def chat_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        raise AIProviderException(
            "Gemini Provider is not fully implemented yet.", status_code=501
        )

    def validate_startup(self) -> None:
        logger.warning("Gemini Provider startup validation called (stub).")
