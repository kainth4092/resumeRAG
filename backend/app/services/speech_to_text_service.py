import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class SpeechToTextService:
    _model_instance: Any = None

    @classmethod
    def get_model(cls):
        if not settings.FEATURE_VOICE_INTERVIEW:
            raise RuntimeError(
                "Voice interview feature is disabled on this instance (FEATURE_VOICE_INTERVIEW=false)."
            )

        if cls._model_instance is None:
            # Lazy import to avoid memory overhead if not enabled or used
            from faster_whisper import WhisperModel

            model_size = settings.WHISPER_MODEL_SIZE
            device = settings.WHISPER_DEVICE
            compute_type = settings.WHISPER_COMPUTE_TYPE
            logger.info(
                "Initializing Faster-Whisper Model: %s on %s (%s)",
                model_size,
                device,
                compute_type,
            )
            try:
                cls._model_instance = WhisperModel(
                    model_size, device=device, compute_type=compute_type
                )
            except Exception as e:
                logger.error("Failed to load Faster-Whisper model: %s", e)
                cls._model_instance = WhisperModel(
                    model_size, device="cpu", compute_type="float32"
                )
        return cls._model_instance

    def transcribe(
        self,
        audio_file_path: str,
        prompt: str | None = None,
        language: str = "en",
    ) -> str:
        """
        Transcribe audio file path to string transcript.
        """
        try:
            model = self.get_model()

            lang_param = None if language in (None, "auto", "") else language

            logger.info(
                "Transcribing audio file: %s with language=%s, vad_filter=True",
                audio_file_path,
                lang_param,
            )

            segments, info = model.transcribe(
                audio_file_path,
                beam_size=5,
                vad_filter=True,
                initial_prompt=prompt,
                language=lang_param,
            )
            transcript_parts = []
            for segment in segments:
                transcript_parts.append(segment.text)

            transcript = " ".join(transcript_parts).strip()
            logger.info(
                "Transcription completed. Language: %s (probability: %.2f)",
                info.language,
                info.language_probability,
            )
            return transcript
        except Exception as e:
            logger.error("Transcription failed: %s", e)
            raise RuntimeError(f"Failed to transcribe audio: {str(e)}")


speech_to_text_service = SpeechToTextService()
