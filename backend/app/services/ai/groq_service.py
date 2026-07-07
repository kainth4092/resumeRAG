import logging
from app.services.ai.base import AIProvider, AIProviderException

logger = logging.getLogger(__name__)


class GroqProvider(AIProvider):
    def __init__(self):
        logger.info("Initializing Groq Provider stub")

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        raise AIProviderException(
            "Groq Provider is not fully implemented yet.", status_code=501
        )

    async def chat_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        raise AIProviderException(
            "Groq Provider is not fully implemented yet.", status_code=501
        )

    def validate_startup(self) -> None:
        logger.warning("Groq Provider startup validation called (stub).")
