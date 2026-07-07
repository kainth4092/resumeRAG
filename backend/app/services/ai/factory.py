import logging
from app.core.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.openrouter_service import OpenRouterProvider
from app.services.ai.ollama_service import OllamaProvider
from app.services.ai.gemini_service import GeminiProvider
from app.services.ai.groq_service import GroqProvider

logger = logging.getLogger(__name__)

_provider_instance: AIProvider = None

def get_ai_provider() -> AIProvider:
    """
    Get or initialize the configured AI provider singleton.
    """
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    provider_name = (settings.AI_PROVIDER or "openrouter").lower().strip()
    logger.info(f"Initializing AI Provider: '{provider_name}'")

    if provider_name == "openrouter":
        _provider_instance = OpenRouterProvider()
    elif provider_name == "ollama":
        _provider_instance = OllamaProvider()
    elif provider_name == "gemini":
        _provider_instance = GeminiProvider()
    elif provider_name == "groq":
        _provider_instance = GroqProvider()
    else:
        logger.error(f"Unsupported AI provider configured: {settings.AI_PROVIDER}")
        # Default fallback to OpenRouter
        logger.warning("Falling back to OpenRouter provider.")
        _provider_instance = OpenRouterProvider()

    return _provider_instance
