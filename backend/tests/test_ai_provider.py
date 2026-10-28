import pytest
from pydantic import BaseModel
from unittest.mock import patch

from app.services.ai.base import AIProvider, LLMValidationError
from app.services.ai.ollama_service import OllamaProvider
from app.services.llm_service import llm_text, llm_json


class FakeAIProvider(AIProvider):
    def __init__(self, canned_response: str = '{"status": "ok"}'):
        self.canned_response = canned_response
        self.last_feature = None
        self.last_json_mode = None

    def validate_startup(self) -> None:
        pass

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        timeout: float | None = None,
        feature: str | None = None,
        json_mode: bool = False,
        **kwargs,
    ) -> str:
        self.last_feature = feature
        self.last_json_mode = json_mode
        return self.canned_response

    async def chat_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        timeout: float | None = None,
        feature: str | None = None,
        json_mode: bool = False,
        **kwargs,
    ) -> str:
        self.last_feature = feature
        self.last_json_mode = json_mode
        return self.canned_response


def test_fake_provider_signature_compatibility():
    fake = FakeAIProvider()
    response = fake.chat(
        system_prompt="sys",
        user_prompt="user",
        feature="personalized_interview_questions",
        json_mode=True,
    )
    assert response == '{"status": "ok"}'
    assert fake.last_feature == "personalized_interview_questions"
    assert fake.last_json_mode is True


def test_ollama_provider_signature_compatibility():
    ollama = OllamaProvider()
    with patch("app.services.ai.ollama_service._sync_client.post") as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "response": '{"test": "ok"}'
        }
        res = ollama.chat(
            system_prompt="sys",
            user_prompt="usr",
            feature="test_feature",
            json_mode=True,
        )
        assert res == '{"test": "ok"}'
        assert mock_post.called
        kwargs = mock_post.call_args[1]
        assert kwargs["json"]["format"] == "json"


class SampleModel(BaseModel):
    name: str
    score: int


def test_llm_text_and_json_with_fake_provider():
    fake = FakeAIProvider(canned_response="Plain text response")
    with patch("app.services.llm_service.get_ai_provider", return_value=fake):
        txt = llm_text("Test prompt", feature="resume_audit")
        assert txt == "Plain text response"
        assert fake.last_feature == "resume_audit"
        assert fake.last_json_mode is False

    fake_json = FakeAIProvider(canned_response='{"name": "Alice", "score": 95}')
    with patch("app.services.llm_service.get_ai_provider", return_value=fake_json):
        result = llm_json("Test json prompt", SampleModel, feature="test_json")
        assert isinstance(result, SampleModel)
        assert result.name == "Alice"
        assert result.score == 95
        assert fake_json.last_feature == "test_json"
        assert fake_json.last_json_mode is True


def test_llm_json_validation_failure_raises_typed_error():
    # Return invalid JSON structure that does not match SampleModel
    fake_bad = FakeAIProvider(canned_response='{"invalid_field": 123}')
    with patch("app.services.llm_service.get_ai_provider", return_value=fake_bad):
        with pytest.raises(LLMValidationError):
            llm_json("Test json prompt", SampleModel, feature="test_json")
