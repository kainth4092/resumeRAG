from abc import ABC, abstractmethod
from app.core.exceptions import AppException

class AIProviderException(AppException):
    """Base exception for all AI provider errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class AIProvider(ABC):
    @abstractmethod
    def chat(self, system_prompt: str, user_prompt: str, temperature: float = 0.1, timeout: float = None) -> str:
        """
        Send a synchronous chat request to the LLM.
        """
        pass

    @abstractmethod
    async def chat_async(self, system_prompt: str, user_prompt: str, temperature: float = 0.1, timeout: float = None) -> str:
        """
        Send an asynchronous chat request to the LLM.
        """
        pass

    @abstractmethod
    def validate_startup(self) -> None:
        """
        Validate the connectivity and model availability for the provider.
        """
        pass
