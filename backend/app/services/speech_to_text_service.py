import os
import logging
from typing import BinaryIO
from faster_whisper import WhisperModel
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class SpeechToTextService:
    _model_instance = None

    @classmethod
    def get_model(cls) -> WhisperModel:
        if cls._model_instance is None:
            model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
            device = os.getenv("WHISPER_DEVICE", "cpu")
            compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "float32")
            logger.info(
                f"Initializing Faster-Whisper Model: {model_size} on {device} ({compute_type})"
            )
            try:
                cls._model_instance = WhisperModel(
                    model_size, device=device, compute_type=compute_type
                )
            except Exception as e:
                logger.error(f"Failed to load Faster-Whisper model: {e}")
                cls._model_instance = WhisperModel(
                    model_size, device="cpu", compute_type="float32"
                )
        return cls._model_instance

    def transcribe(self, audio_file_path: str) -> str:
        """
        Transcribe audio file path to string transcript.
        """
        try:
            model = self.get_model()
            segments, info = model.transcribe(audio_file_path, beam_size=5)
            transcript_parts = []
            for segment in segments:
                transcript_parts.append(segment.text)

            transcript = " ".join(transcript_parts).strip()
            logger.info(
                f"Transcription completed. Language: {info.language} (probability: {info.language_probability:.2f})"
            )
            return transcript
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise RuntimeError(f"Failed to transcribe audio: {str(e)}")


speech_to_text_service = SpeechToTextService()
