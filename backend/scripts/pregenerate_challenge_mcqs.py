#!/usr/bin/env python3
"""
Offline script to pre-generate MCQs for InterviewQuestionBank rows
that are missing MCQ data (option_a, option_b, option_c, option_d, correct_option).
"""
import sys
import os
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank
from app.services.llm_service import llm_json
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pregenerate_challenge_mcqs")


class MCQResponse(BaseModel):
    option_a: str = Field(..., description="Option A")
    option_b: str = Field(..., description="Option B")
    option_c: str = Field(..., description="Option C")
    option_d: str = Field(..., description="Option D")
    correct_option: str = Field(..., description="One of A, B, C, or D")
    short_explanation: str = Field(..., description="1-2 sentences explaining why the correct option is right")


def pregenerate_mcqs(limit: int = 50):
    db = SessionLocal()
    try:
        unprocessed = (
            db.query(InterviewQuestionBank)
            .filter(
                (InterviewQuestionBank.option_a.is_(None))
                | (InterviewQuestionBank.correct_option.is_(None))
            )
            .limit(limit)
            .all()
        )

        logger.info("Found %d questions needing MCQ pre-generation", len(unprocessed))

        success_count = 0
        for q in unprocessed:
            logger.info("Processing question id=%d: %s", q.id, q.question[:60])
            prompt = (
                f"Generate a challenging 4-option multiple choice question (MCQ) based on:\n"
                f"Question: {q.question}\n"
                f"Skill: {q.skill or 'General'}\n"
                f"Answer: {q.answer or 'General knowledge'}\n\n"
                f"Requirements:\n"
                f"1. Generate 4 distinct, plausible options: option_a, option_b, option_c, option_d.\n"
                f"2. Exactly one option must be unambiguously correct.\n"
                f"3. Return correct_option as 'A', 'B', 'C', or 'D'.\n"
                f"4. Return short_explanation explaining why the answer is correct."
            )
            try:
                mcq_data: MCQResponse = llm_json(
                    prompt,
                    response_model=MCQResponse,
                    feature="offline_mcq_generation",
                    temperature=0.2,
                )
                q.option_a = mcq_data.option_a.strip()
                q.option_b = mcq_data.option_b.strip()
                q.option_c = mcq_data.option_c.strip()
                q.option_d = mcq_data.option_d.strip()
                q.correct_option = mcq_data.correct_option.strip().upper()
                q.short_explanation = mcq_data.short_explanation.strip()
                db.commit()
                success_count += 1
            except Exception as e:
                logger.error("Failed to generate MCQ for question id=%d: %s", q.id, e)
                db.rollback()

        logger.info("Successfully pre-generated %d/%d MCQs", success_count, len(unprocessed))
    finally:
        db.close()


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    pregenerate_mcqs(count)
