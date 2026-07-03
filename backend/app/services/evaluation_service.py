import os
import json
import logging
import requests
from typing import Dict, Any, List

from app.core.config import settings

logger = logging.getLogger(__name__)


class EvaluationService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL

    def evaluate_interview(self, answers_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluate all candidate answers together using local Ollama.
        Each item in answers_data has: 'question_text', 'transcript'
        """
        if not self.base_url:
            logger.warning(
                "OLLAMA_BASE_URL is not configured; using fallback interview evaluation."
            )
            return self._get_fallback_interview_evaluation(
                answers_data,
                "OLLAMA_BASE_URL is not configured.",
            )

        url = f"{self.base_url}/api/chat"

        system_prompt = (
            "You are an expert technical interviewer and communications coach. "
            "Evaluate the candidate's spoken answers to all the interview questions. "
            "You must return ONLY a JSON object containing the overall evaluation and individual question breakdowns. "
            "Do not include any introductory text, markdown block wrappers, or explanation outside the JSON.\n\n"
            "JSON Schema:\n"
            "{\n"
            '  "overall_score": 0-100 integer,\n'
            '  "performance_summary": "a comprehensive overall summary of the candidate\'s performance across all questions",\n'
            '  "answers": [\n'
            "    {\n"
            '      "question_text": "the exact question text",\n'
            '      "overall_score": 0-100 integer,\n'
            '      "technical_score": 0-100 integer,\n'
            '      "communication_score": 0-100 integer,\n'
            '      "clarity_score": 0-100 integer,\n'
            '      "confidence_score": 0-100 integer,\n'
            '      "grammar_score": 0-100 integer,\n'
            '      "strengths": ["strength 1", "strength 2"],\n'
            '      "weaknesses": ["weakness 1", "weakness 2"],\n'
            '      "missing_points": ["missing point 1", "missing point 2"],\n'
            '      "improvements": ["improvement 1", "improvement 2"],\n'
            '      "ideal_answer": "a high-quality, comprehensive ideal response to the question"\n'
            "    }\n"
            "  ]\n"
            "}"
        )

        # Build user prompt
        user_content_parts = ["Please evaluate the following interview responses:\n"]
        for idx, item in enumerate(answers_data):
            user_content_parts.append(
                f"Question {idx+1}: {item['question_text']}\n"
                f"Candidate Answer {idx+1}: {item.get('transcript') or 'Skipped/No answer'}\n"
            )
        user_content_parts.append("\nPerform the evaluation and output the JSON now.")
        user_content = "\n".join(user_content_parts)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.2},
        }

        # Auto-retry logic (max 2 attempts)
        for attempt in range(1, 3):
            try:
                logger.info(
                    f"Ollama evaluation request (attempt {attempt}/2) for {len(answers_data)} questions."
                )
                response = requests.post(url, json=payload, timeout=60)
                response.raise_for_status()

                res_data = response.json()
                message_content = res_data.get("message", {}).get("content", "")

                evaluation = self._parse_json_content(message_content)

                # Basic validation to ensure "answers" is in returned JSON and has correct length
                if "answers" not in evaluation or not isinstance(
                    evaluation["answers"], list
                ):
                    raise ValueError("Ollama JSON response missing 'answers' list.")

                return evaluation

            except Exception as e:
                logger.error(
                    "Ollama evaluation attempt %s failed: %s", attempt, e, exc_info=True
                )
                if attempt == 2:
                    return self._get_fallback_interview_evaluation(answers_data, str(e))

    def _parse_json_content(self, content: str) -> Dict[str, Any]:
        """
        Clean and parse the response from Ollama.
        """
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError as jde:
            logger.error("Failed to decode JSON from Ollama output: %s", jde, exc_info=True)
            raise ValueError("Ollama did not return a valid JSON object.")

    def _get_fallback_interview_evaluation(
        self, answers_data: List[Dict[str, Any]], error_msg: str
    ) -> Dict[str, Any]:
        """
        Fallback structured JSON response when Ollama fails twice.
        """
        logger.warning(
            "Generating fallback batch interview evaluation due to service error."
        )

        fallback_answers = []
        total_score = 0

        for item in answers_data:
            transcript = item.get("transcript") or ""
            words = transcript.split()
            word_count = len(words)

            score = 65
            if word_count > 30:
                score = 80
            elif word_count > 10:
                score = 70
            elif word_count == 0:
                score = 0

            total_score += score

            fallback_answers.append(
                {
                    "question_text": item["question_text"],
                    "overall_score": score,
                    "technical_score": max(0, score - 2),
                    "communication_score": max(0, score + 3),
                    "clarity_score": max(0, score + 1),
                    "confidence_score": max(0, score - 1),
                    "grammar_score": 80 if word_count > 0 else 0,
                    "strengths": [
                        (
                            "Answered the question verbally."
                            if word_count > 0
                            else "Skipped question."
                        )
                    ],
                    "weaknesses": [
                        "Evaluation service unavailable, fallback heuristic applied."
                    ],
                    "missing_points": [
                        "Unable to evaluate missing concepts due to offline AI."
                    ],
                    "improvements": [
                        "Check Ollama server health or pull the configured model."
                    ],
                    "ideal_answer": "This is a placeholder ideal answer since the local AI model was unreachable. Please review typical technical documentation for this question.",
                }
            )

        avg_score = round(total_score / len(answers_data)) if answers_data else 0

        return {
            "overall_score": avg_score,
            "performance_summary": f"Evaluation fallback completed for {len(answers_data)} questions. Details: {error_msg[:100]}",
            "answers": fallback_answers,
        }


# Singleton instance
evaluation_service = EvaluationService()
