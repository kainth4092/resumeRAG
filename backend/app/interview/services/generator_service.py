import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.interview.schemas.question import QuestionBankItem, InterviewPipelineConfig
from app.interview.repository.question_repository import QuestionRepository
from app.interview.filters.question_filter import QuestionFilter
from app.interview.services.matching_service import SkillMatchingService
from app.interview.utils.randomizer import QuestionRandomizer

logger = logging.getLogger(__name__)


class InterviewGeneratorService:
    def __init__(self, repository: Optional[QuestionRepository] = None):
        self.repository = repository or QuestionRepository()

    def generate_session_questions(
        self,
        resume_text: str,
        job_description: str,
        config: Optional[InterviewPipelineConfig] = None,
        db: Optional[Session] = None,
        user_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Flow:
        Resume & JD -> Skill Extraction -> Filtering (Skills, Difficulty, Category) -> Randomization -> Session questions
        """
        if config is None:
            config = InterviewPipelineConfig()

        # Step 1 & 2: Skill Extraction & Matching
        matched_skills = SkillMatchingService.match_candidate_skills(
            resume_text, job_description
        )
        logger.info("Extracted matching skills for interview: %s", matched_skills)

        # Step 3: Load Catalog
        if db is not None:
            logger.info("Loading catalog questions from the database.")
            from app.models.interview_bank import InterviewQuestionBank

            db_questions = db.query(InterviewQuestionBank).all()
            catalog = []
            for db_q in db_questions:
                difficulty = (db_q.difficulty or "Medium").strip().title()
                if difficulty not in {"Easy", "Medium", "Hard"}:
                    logger.warning(
                        "Invalid difficulty '%s' for interview question id=%s. "
                        "Using Medium fallback.",
                        db_q.difficulty,
                        db_q.id,
                    )
                    difficulty = "Medium"

                catalog.append(
                    QuestionBankItem(
                        id=str(db_q.id),
                        question=db_q.question,
                        category=db_q.category or "Technical",
                        difficulty=difficulty,
                        skills=[db_q.skill] if db_q.skill else [],
                        question_type="Short Answer",
                        estimated_duration="2-3 minutes",
                        sample_answer=db_q.answer,
                        key_points=db_q.tags or [],
                    )
                )
            logger.info(
                "Loaded %d questions from the database to populate catalog",
                len(catalog),
            )
        else:
            catalog = self.repository.get_all()

        # Step 4: Question Filtering by skills
        filtered_by_skills = QuestionFilter.filter_by_skills(catalog, matched_skills)
        logger.info(
            "Matched %d questions matching extracted skills", len(filtered_by_skills)
        )

        if len(filtered_by_skills) < config.length:
            logger.info(
                "Only %d skill-matched catalog questions are available for %d requested "
                "questions. Keeping the active-resume skill pool and allowing AI "
                "generation to fill the remaining slots.",
                len(filtered_by_skills),
                config.length,
            )

        # Step 5: Difficulty & Category Filtering
        filtered_pool = filtered_by_skills

        # Step 6: Select Technical Questions from the DB
        db_target = config.length // 2

        tech_db_pool = [
            q
            for q in filtered_pool
            if q.category.lower() in ("technical", "coding", "theory")
        ]
        if not tech_db_pool:
            tech_db_pool = filtered_pool

        selected_db_questions = QuestionRandomizer.select_questions(
            pool=tech_db_pool,
            length=db_target,
            difficulty_distribution=config.difficulty_distribution,
            priority_skills=list(matched_skills),
        )
        logger.info(
            "Selected %d technical questions from database", len(selected_db_questions)
        )

        # Step 7: Format and populate selected DB questions
        selected_questions_dicts = []
        for q in selected_db_questions:
            selected_questions_dicts.append(
                {
                    "question": q.question,
                    "category": q.category.title(),
                    "difficulty": q.difficulty.title(),
                    "estimated_duration": q.estimated_duration,
                    "tech_skill": q.skills[0] if q.skills else None,
                    "answer": q.sample_answer,
                }
            )

        # Step 8: Call AI Generator to get Project/Experience/Behavioral questions
        ai_questions = []
        try:
            logger.info("Generating AI questions for Projects and Experience")
            from app.interview.services.interview_service import (
                generate_interview_questions,
            )

            ai_payload = generate_interview_questions(
                resume_text, job_description, target_count=config.length
            )

            for cat in ["project", "experience", "technical"]:
                if cat in ai_payload and isinstance(ai_payload[cat], list):
                    for q in ai_payload[cat]:
                        ai_questions.append(
                            {
                                "question": q.get("question", ""),
                                "category": cat.title(),
                                "difficulty": q.get("difficulty", "Medium"),
                                "estimated_duration": q.get(
                                    "estimated_duration", "2-3 minutes"
                                ),
                                "tech_skill": q.get("tech_skill"),
                                "answer": None,
                            }
                        )

        except Exception as e:
            logger.error(
                "Failed to generate AI questions: %s. Using DB fallback.", str(e)
            )
        remaining_slots = config.length - len(selected_questions_dicts)

        if remaining_slots > 0 and ai_questions:

            selected_questions_dicts.extend(ai_questions[:remaining_slots])

        logger.info(
            "Added %d AI questions to interview session.",
            min(remaining_slots, len(ai_questions)),
        )

        if len(selected_questions_dicts) < config.length:
            remaining_needed = config.length - len(selected_questions_dicts)
            additional_db = QuestionRandomizer.select_questions(
                pool=[
                    q
                    for q in filtered_pool
                    if q.question
                    not in {eq["question"] for eq in selected_questions_dicts}
                ],
                length=remaining_needed,
                difficulty_distribution=config.difficulty_distribution,
            )
            for q in additional_db:
                selected_questions_dicts.append(
                    {
                        "question": q.question,
                        "category": q.category.title(),
                        "difficulty": q.difficulty.title(),
                        "estimated_duration": q.estimated_duration,
                        "tech_skill": q.skills[0] if q.skills else None,
                        "answer": q.sample_answer,
                    }
                )

        return selected_questions_dicts
