import logging
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.schemas.interview_bank import InterviewQuestionCreate
from app.services.llm_service import (
    generate_interview_bank_questions,
)
from app.interview.services.interview_bank_service import (
    create_question,
)

logger = logging.getLogger(__name__)

MIN_QUESTIONS_PER_SKILL = 10
DEFAULT_EXPERIENCE = "Intermediate"


class InterviewBankExpansionService:

    @staticmethod
    def get_skill_counts(
        db: Session,
    ) -> dict[str, int]:

        rows = (
            db.query(
                func.lower(InterviewQuestionBank.skill),
                func.count(InterviewQuestionBank.id),
            )
            .group_by(func.lower(InterviewQuestionBank.skill))
            .all()
        )

        return {skill: count for skill, count in rows}

    @staticmethod
    def normalize_skills(
        skills: list[str],
    ) -> list[str]:

        normalized = []

        seen = set()

        for skill in skills:

            if not skill:
                continue

            value = skill.strip()

            if not value:
                continue

            key = value.lower()

            if key in seen:
                continue

            seen.add(key)

            normalized.append(value)

        return normalized

    @staticmethod
    def get_missing_skills(
        db: Session,
        resume_skills: list[str],
    ):

        resume_skills = InterviewBankExpansionService.normalize_skills(resume_skills)

        counts = InterviewBankExpansionService.get_skill_counts(db)

        missing = []

        for skill in resume_skills:

            total = counts.get(
                skill.lower(),
                0,
            )

            if total >= MIN_QUESTIONS_PER_SKILL:
                continue

            missing.append(
                {
                    "skill": skill,
                    "existing": total,
                    "required": (MIN_QUESTIONS_PER_SKILL - total),
                }
            )

        logger.info(
            "Missing interview coverage: %s",
            missing,
        )

        return missing

    @staticmethod
    def generate_questions_for_skill(
        skill: str,
        required: int,
    ) -> list[InterviewQuestionCreate]:

        generated = generate_interview_bank_questions(
            skill=skill,
            experience_level=DEFAULT_EXPERIENCE,
            count=required,
        )

        payloads = []

        seen = set()

        for item in generated:

            question = item.get(
                "question",
                "",
            ).strip()

            if len(question) < 10:
                continue

            key = question.lower()

            if key in seen:
                continue

            seen.add(key)

            payloads.append(
                InterviewQuestionCreate(
                    question=question,
                    answer=None,
                    skill=skill,
                    category=item.get(
                        "category",
                        "Technical",
                    ),
                    experience_level=DEFAULT_EXPERIENCE,
                    company=None,
                    role=None,
                    tags=[skill],
                )
            )

        logger.info(
            "Generated %d payloads for %s",
            len(payloads),
            skill,
        )

        return payloads

    @staticmethod
    def question_exists(
        db: Session,
        question: str,
    ) -> bool:

        return (
            db.query(InterviewQuestionBank.id)
            .filter(func.lower(InterviewQuestionBank.question) == question.lower())
            .first()
            is not None
        )

    @staticmethod
    def create_generated_questions(
        db: Session,
        user_id: int,
        payloads: list[InterviewQuestionCreate],
    ) -> int:

        created = 0

        for payload in payloads:

            if InterviewBankExpansionService.question_exists(
                db,
                payload.question,
            ):
                continue

            try:

                create_question(
                    db=db,
                    payload=payload,
                    created_by=user_id,
                    background_tasks=None,
                )

                created += 1

            except Exception:

                logger.exception(
                    "Failed creating interview question: %s",
                    payload.question,
                )

        return created

    @staticmethod
    def expand_bank(
        db: Session,
        user_id: int,
        resume_skills: list[str],
    ) -> int:

        missing = InterviewBankExpansionService.get_missing_skills(
            db,
            resume_skills,
        )

        total_created = 0

        for item in missing:

            payloads = InterviewBankExpansionService.generate_questions_for_skill(
                skill=item["skill"],
                required=item["required"],
            )

            total_created += InterviewBankExpansionService.create_generated_questions(
                db=db,
                user_id=user_id,
                payloads=payloads,
            )

        logger.info(
            "Interview bank expanded with %d new questions.",
            total_created,
        )

        return total_created
