import json
import logging
from typing import Dict, Any, List

from app.services.ai import get_ai_provider

logger = logging.getLogger(__name__)


class EvaluationService:
    def __init__(self):
        self.ai_provider = get_ai_provider()

    def evaluate_interview(
        self,
        answers_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Evaluate all candidate answers together using the
        application's configured AI provider.

        Each item contains:
        - question_text
        - transcript
        """
        system_prompt = (
            "You are an expert technical interviewer and "
            "communications coach. Evaluate the candidate's "
            "spoken answers accurately. Do not reward an empty, "
            "skipped, missing, or meaningless answer. A skipped "
            "answer must receive zero for all numeric scores. "
            "Return ONLY one valid JSON object. Do not include "
            "markdown, code fences, introductory text, or text "
            "outside the JSON.\n\n"
            "JSON Schema:\n"
            "{\n"
            '  "overall_score": 0,\n'
            '  "performance_summary": "overall summary",\n'
            '  "answers": [\n'
            "    {\n"
            '      "question_text": "exact question text",\n'
            '      "overall_score": 0,\n'
            '      "technical_score": 0,\n'
            '      "communication_score": 0,\n'
            '      "clarity_score": 0,\n'
            '      "confidence_score": 0,\n'
            '      "grammar_score": 0,\n'
            '      "strengths": [],\n'
            '      "weaknesses": [],\n'
            '      "missing_points": [],\n'
            '      "improvements": [],\n'
            '      "ideal_answer": "high-quality ideal answer"\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Scoring rules:\n"
            "- Every score must be an integer from 0 to 100.\n"
            "- Judge technical correctness, relevance, clarity, "
            "communication, confidence, and grammar.\n"
            "- Do not infer knowledge that the candidate did not "
            "demonstrate.\n"
            "- Empty, skipped, whitespace-only, or no-answer "
            "responses receive 0 in every score category.\n"
            "- Preserve every question exactly and return one "
            "evaluation for every supplied question.\n"
            "- The overall score must reflect all questions, "
            "including skipped questions."
        )

        user_content_parts = [
            "Evaluate these interview responses:\n"
        ]

        for index, item in enumerate(
            answers_data,
            start=1,
        ):
            question_text = str(
                item.get("question_text") or ""
            ).strip()

            transcript = str(
                item.get("transcript") or ""
            ).strip()

            if not transcript:
                transcript = "[SKIPPED - NO ANSWER]"

            user_content_parts.append(
                f"Question {index}: {question_text}\n"
                f"Candidate Answer {index}: "
                f"{transcript}\n"
            )

        user_prompt = "\n".join(
            user_content_parts
        )

        try:
            logger.info(
                "Interview evaluation request through "
                "configured AI provider for %s questions.",
                len(answers_data),
            )

            content = self.ai_provider.chat(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.1,
                timeout=120.0,
            )

            evaluation = self._parse_json_content(
                content
            )

            self._validate_evaluation(
                evaluation,
                answers_data,
            )

            return evaluation

        except Exception as exc:
            logger.error(
                "Interview evaluation failed: %s",
                exc,
                exc_info=True,
            )

            return (
                self._get_fallback_interview_evaluation(
                    answers_data,
                    str(exc),
                )
            )

    def _parse_json_content(self, content: str) -> Dict[str, Any]:
        """
        Clean and parse the configured AI provider response.
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
            logger.error(
                "Failed to decode JSON from AI provider output: %s",
                jde,
                exc_info=True,
            )
            raise ValueError(
                "AI provider did not return a valid JSON object."
            )

    def _validate_evaluation(
        self,
        evaluation: Dict[str, Any],
        answers_data: List[Dict[str, Any]],
    ) -> None:
        """
        Validate the minimum structure returned by the AI
        provider before the report is accepted.
        """
        answers = evaluation.get("answers")

        if not isinstance(answers, list):
            raise ValueError(
                "AI evaluation is missing the answers list."
            )

        if len(answers) != len(answers_data):
            raise ValueError(
                "AI evaluation answer count does not match "
                "the submitted question count."
            )

        if not isinstance(
            evaluation.get("overall_score"),
            int,
        ):
            raise ValueError(
                "AI evaluation has an invalid overall score."
            )

        score_fields = (
            "overall_score",
            "technical_score",
            "communication_score",
            "clarity_score",
            "confidence_score",
            "grammar_score",
        )

        for index, answer in enumerate(answers):
            if not isinstance(answer, dict):
                raise ValueError(
                    "AI evaluation contains an invalid "
                    "answer object."
                )

            for field in score_fields:
                score = answer.get(field)

                if (
                    not isinstance(score, int)
                    or isinstance(score, bool)
                    or score < 0
                    or score > 100
                ):
                    raise ValueError(
                        f"Invalid {field} for answer "
                        f"{index + 1}."
                    )

    def _get_fallback_interview_evaluation(
        self,
        answers_data: List[Dict[str, Any]],
        error_msg: str,
    ) -> Dict[str, Any]:
        """
        Return a transparent unavailable-state report when
        the configured AI provider cannot evaluate answers.

        No heuristic or fabricated scores are generated.
        """
        logger.warning(
            "Generating unavailable-state interview report "
            "because the AI evaluation service failed."
        )

        fallback_answers = []

        for item in answers_data:
            question_text = str(
                item.get("question_text") or ""
            )

            transcript = str(
                item.get("transcript") or ""
            ).strip()

            was_answered = bool(transcript)

            fallback_answers.append(
                {
                    "question_text": question_text,
                    "overall_score": 0,
                    "technical_score": 0,
                    "communication_score": 0,
                    "clarity_score": 0,
                    "confidence_score": 0,
                    "grammar_score": 0,
                    "strengths": [],
                    "weaknesses": (
                        [
                            "The answer could not be evaluated "
                            "because the AI evaluation service "
                            "was unavailable."
                        ]
                        if was_answered
                        else [
                            "No answer was provided."
                        ]
                    ),
                    "missing_points": [],
                    "improvements": (
                        [
                            "Retry the evaluation when the AI "
                            "service is available."
                        ]
                        if was_answered
                        else [
                            "Provide an answer before requesting "
                            "an evaluation."
                        ]
                    ),
                    "ideal_answer": "",
                    "evaluation_status": "unavailable",
                }
            )

        return {
            "overall_score": 0,
            "performance_summary": (
                "The interview was completed, but AI evaluation "
                "is currently unavailable. No estimated or "
                "heuristic scores were generated. Please retry "
                "the evaluation later."
            ),
            "answers": fallback_answers,
            "evaluation_status": "unavailable",
            "evaluation_error": error_msg[:200],
        }


# Singleton instance
evaluation_service = EvaluationService()
