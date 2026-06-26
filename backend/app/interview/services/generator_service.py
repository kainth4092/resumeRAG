import logging
from typing import List, Dict, Any, Optional
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
        config: Optional[InterviewPipelineConfig] = None
    ) -> List[Dict[str, Any]]:
        """
        Flow:
        Resume & JD -> Skill Extraction -> Filtering (Skills, Difficulty, Category) -> Randomization -> Session questions
        """
        if config is None:
            config = InterviewPipelineConfig()

        # Step 1 & 2: Skill Extraction & Matching
        matched_skills = SkillMatchingService.match_candidate_skills(resume_text, job_description)
        logger.info("Extracted matching skills for interview: %s", matched_skills)

        # Step 3: Load Catalog
        catalog = self.repository.get_all()
        
        # Step 4: Question Filtering by skills
        filtered_by_skills = QuestionFilter.filter_by_skills(catalog, matched_skills)
        logger.info("Matched %d questions matching extracted skills", len(filtered_by_skills))

        # (Optional) If we don't have enough curated questions, fallback to entire catalog
        if len(filtered_by_skills) < config.length:
            logger.info("Insufficient skill-specific questions, falling back to full catalog")
            filtered_by_skills = catalog

        # Step 5: Difficulty & Category Filtering
        filtered_pool = filtered_by_skills

        # Step 6: Randomization
        selected_questions = QuestionRandomizer.select_questions(
            pool=filtered_pool,
            length=config.length,
            difficulty_distribution=config.difficulty_distribution
        )
        logger.info("Selected %d questions from local Question Bank", len(selected_questions))

        # Step 7: Hybrid Mode or AI Fallback
        # If the question bank is empty or hybrid mode is requested, or we couldn't fulfill the length:
        if len(selected_questions) < config.length or config.hybrid_mode:
            logger.info("Triggering AI Generator fallback/hybrid integration")
            # Import dynamically to avoid circular dependency
            from app.services.interview_service import generate_interview_questions
            
            ai_needed = config.length - len(selected_questions)
            try:
                ai_payload = generate_interview_questions(resume_text, job_description)
                
                # Convert AI response into standard question dicts
                ai_questions = []
                for cat in ["technical", "project", "experience"]:
                    if cat in ai_payload and isinstance(ai_payload[cat], list):
                        for q in ai_payload[cat]:
                            ai_questions.append({
                                "question": q.get("question", ""),
                                "category": cat.title(),
                                "difficulty": q.get("difficulty", "Medium"),
                                "estimated_duration": q.get("estimated_duration", "2-3 minutes"),
                                "tech_skill": q.get("tech_skill"),
                                "answer": None
                            })
                
                # Add AI questions to reach target count
                import random
                random.shuffle(ai_questions)
                selected_questions_dicts = []
                
                # First add all curated ones
                for q in selected_questions:
                    selected_questions_dicts.append({
                        "question": q.question,
                        "category": q.category.title(),
                        "difficulty": q.difficulty.title(),
                        "estimated_duration": q.estimated_duration,
                        "tech_skill": q.skills[0] if q.skills else None,
                        "answer": q.sample_answer
                    })
                
                # Fill up remaining slots with AI questions
                for ai_q in ai_questions:
                    if len(selected_questions_dicts) >= config.length:
                        break
                    # Avoid duplicates
                    existing_texts = {eq["question"].lower().strip() for eq in selected_questions_dicts}
                    if ai_q["question"].lower().strip() not in existing_texts:
                        selected_questions_dicts.append(ai_q)
                        
                return selected_questions_dicts
            except Exception as e:
                logger.error("Failed to generate AI fallback questions: %s", str(e))
                
        # Format curated questions for database insertion
        formatted = []
        for q in selected_questions:
            formatted.append({
                "question": q.question,
                "category": q.category.title(),
                "difficulty": q.difficulty.title(),
                "estimated_duration": q.estimated_duration,
                "tech_skill": q.skills[0] if q.skills else None,
                "answer": q.sample_answer
            })
        return formatted
