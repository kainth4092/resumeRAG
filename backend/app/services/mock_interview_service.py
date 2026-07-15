import json
import random
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.interview.services.matching_service import SkillMatchingService
from app.models.interview_bank import InterviewQuestionBank
from app.models.mock_interview import MockInterviewAnswer, MockInterviewSession
from app.resume.repository.resume_repository import ResumeRepository
from app.resume.services.resume_normalizer import coerce_to_canonical
from app.services.candidate_context_service import infer_candidate_level

logger = logging.getLogger(__name__)

QUESTION_BANK_SKILL_ALIASES = {
    "python": {
        "python",
        "scikit-learn",
        "python data pipelines",
    },
    "fastapi": {
        "fastapi",
        "rest api",
        "rest apis",
    },
    "postgresql": {
        "postgresql",
        "postgres",
    },
    "sql": {
        "sql",
        "spark sql",
    },
    "docker": {
        "docker",
        "containers",
        "containerization",
    },
    "git": {
        "git",
        "github",
        "azure devops",
        "ci/cd",
    },
    "machine learning": {
        "machine learning",
        "scikit-learn",
        "classification",
        "regression",
        "clustering",
        "feature engineering",
        "model evaluation",
        "hyperparameter tuning",
        "forecasting",
        "time series",
    },
    "rag": {
        "rag",
        "retrieval qa",
        "retrieval augmented generation",
    },
    "ai": {
        "artificial intelligence",
        "semantic ai",
        "applied ai",
    },
    "nlp": {
        "nlp",
        "natural language processing",
        "text preprocessing",
        "topic modelling",
        "topic modeling",
        "sentence transformers",
        "sbert",
    },
    "semantic search": {
        "semantic search",
        "semantic matching",
        "search relevance",
        "dense retrieval",
        "sparse retrieval",
        "hybrid search",
        "recommendation",
        "ranking",
    },
    "embeddings & vector search": {
        "embedding",
        "embeddings",
        "sentence embedding",
        "sentence embeddings",
        "sentence transformer",
        "sentence transformers",
        "sbert",
        "bi-encoder",
        "cross-encoder",
        "cosine similarity",
        "dot-product similarity",
        "vector search",
        "faiss",
        "chroma",
        "chroma db",
        "azure ai search",
    },
    "mlops": {
        "mlops",
        "mlflow",
        "model lifecycle",
        "model registry",
        "model monitoring",
        "experiment tracking",
        "distributed model pipelines",
        "production support",
        "ci/cd",
    },
    "pyspark": {
        "pyspark",
        "apache spark",
        "spark sql",
        "databricks",
        "azure databricks",
        "distributed model pipelines",
    },
}

SYSTEM_BEHAVIORAL_QUESTIONS = [
    {
        "question": "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
        "answer": "Use the STAR method: describe the Situation, the Task, the Action you took to resolve it constructively, and the positive Result/learning outcome.",
        "skill": "Conflict Resolution",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "Describe a difficult project challenge you faced and how you overcame it.",
        "answer": "Explain the technical or team constraint, your plan of action, the implementation details, and what you successfully delivered.",
        "skill": "Problem Solving",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "Why do you want to join our company, and where do you see yourself in 5 years?",
        "answer": "Align your career goals with the company's growth, technology stack, and values, showing commitment to long-term mutual growth.",
        "skill": "HR Fundamentals",
        "category": "Behavioral",
        "experience_level": "Fresher",
    },
    {
        "question": "Tell me about a time you disagreed with a decision made by a manager or lead. How did you handle it?",
        "answer": "Describe how you communicated your perspective professionally, listened to their reasoning, reached a compromise, and supported the final decision.",
        "skill": "Professionalism",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "Walk me through a time you had to learn a new technology quickly to solve a problem.",
        "answer": "Detail the context, how you prioritized learning (docs, tutorials, prototyping), applied it to the task, and the outcome of the implementation.",
        "skill": "Adaptability",
        "category": "Behavioral",
        "experience_level": "Fresher",
    },
    {
        "question": "Describe a situation where you had to manage multiple competing priorities. How did you handle the pressure?",
        "answer": "Explain how you evaluated the urgency/impact of each task, aligned with stakeholders, set expectations, and successfully met deadlines.",
        "skill": "Time Management",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "Tell me about a time you made a mistake at work. What did you do, and what did you learn?",
        "answer": "Own the mistake honestly, explain the immediate corrective actions you took, and describe the systemic changes you made to prevent it from happening again.",
        "skill": "Accountability",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "What are your greatest professional strengths and weaknesses?",
        "answer": "Highlight strengths relevant to the role (e.g. self-driven learning). For weaknesses, name a real area you've identified and show active steps you've taken to improve it.",
        "skill": "Self Awareness",
        "category": "Behavioral",
        "experience_level": "Fresher",
    },
    {
        "question": "Tell me about a time you mentored a junior colleague or helped a teammate struggle with a task.",
        "answer": "Show leadership and empathy: how you identified their bottleneck, guided them to the solution instead of doing it for them, and how it helped the team.",
        "skill": "Leadership",
        "category": "Behavioral",
        "experience_level": "Intermediate",
    },
    {
        "question": "Can you introduce yourself and walk me through your background?",
        "answer": "Provide a brief 2-minute elevator pitch summarizing your education, core technical skills, key projects/achievements, and interest in this role.",
        "skill": "HR Fundamentals",
        "category": "Behavioral",
        "experience_level": "Fresher",
    },
]


class MockInterviewService:
    @staticmethod
    def _match_question_bank_skills(
        candidate_skills,
        available_bank_skills,
    ):
        candidate_text = " | ".join(
            str(skill).strip().lower()
            for skill in candidate_skills
            if str(skill).strip()
        )

        matched_skills = []

        for bank_skill in available_bank_skills:
            normalized_bank_skill = str(bank_skill).strip().lower()

            if not normalized_bank_skill:
                continue

            aliases = QUESTION_BANK_SKILL_ALIASES.get(
                normalized_bank_skill,
                {
                    normalized_bank_skill,
                },
            )

            if any(alias in candidate_text for alias in aliases):
                matched_skills.append(str(bank_skill).strip())

        return matched_skills

    def _ensure_behavioral_questions(self, db: Session):
        """
        Dynamically populates high-quality behavioral questions in database if missing.
        """
        try:
            exists = (
                db.query(InterviewQuestionBank)
                .filter(InterviewQuestionBank.category == "Behavioral")
                .first()
            )
            if not exists:
                logger.info(
                    "Seeding default behavioral mock interview questions into the bank..."
                )
                for item in SYSTEM_BEHAVIORAL_QUESTIONS:
                    q = InterviewQuestionBank(
                        question=item["question"],
                        answer=item["answer"],
                        skill=item["skill"],
                        category=item["category"],
                        experience_level=item["experience_level"],
                        source="System",
                    )
                    db.add(q)
                db.commit()
                logger.info("Successfully seeded default behavioral questions.")
        except Exception as e:
            logger.error(f"Error seeding behavioral questions: {e}")
            db.rollback()

    def get_interview_questions(
        self,
        db: Session,
        interview_type: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Build an eight-question mock interview from the authenticated
        user's active resume:

        1 introduction question
        1 active-resume project question
        4 active-resume technical questions
        2 candidate-level scenario questions
        """

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Authentication is required.",
            )

        logger.info(
            "Generating active-resume mock interview "
            "for user_id=%s interview_type=%s",
            user_id,
            interview_type,
        )

        self._ensure_behavioral_questions(db)

        active_resume = ResumeRepository.get_active_resume(
            db,
            user_id,
        )

        if not active_resume:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No active resume found. "
                    "Please select an active resume before "
                    "starting a mock interview."
                ),
            )

        canonical_resume: Dict[str, Any] = {}

        if active_resume.resume_json:
            try:
                loaded_resume = json.loads(active_resume.resume_json)

                if isinstance(loaded_resume, dict):
                    canonical_resume = coerce_to_canonical(loaded_resume)

            except (TypeError, ValueError, json.JSONDecodeError):
                logger.warning(
                    "Invalid resume_json for active resume ID %s. "
                    "Using parsed-text fallback.",
                    active_resume.id,
                )

        resume_text = active_resume.parsed_text or ""

        canonical_skills = {
            str(skill).strip()
            for skill in canonical_resume.get(
                "skills",
                [],
            )
            if str(skill).strip()
        }

        extracted_skills = SkillMatchingService.extract_skills_from_text(resume_text)

        candidate_skills = canonical_skills | extracted_skills

        available_bank_skills = [
            row[0]
            for row in (
                db.query(InterviewQuestionBank.skill)
                .filter(InterviewQuestionBank.skill.isnot(None))
                .distinct()
                .all()
            )
            if row[0]
        ]

        matched_bank_skills = self._match_question_bank_skills(
            candidate_skills=candidate_skills,
            available_bank_skills=(available_bank_skills),
        )

        normalized_candidate_skills = {skill.lower() for skill in matched_bank_skills}

        logger.info(
            "Matched active-resume skills to " "question-bank skills: %s",
            sorted(
                matched_bank_skills,
                key=str.lower,
            ),
        )

        projects = [
            project
            for project in canonical_resume.get(
                "projects",
                [],
            )
            if isinstance(project, dict)
        ]

        experience_entries = [
            experience
            for experience in canonical_resume.get(
                "experience",
                [],
            )
            if isinstance(experience, dict)
        ]

        summary = str(
            canonical_resume.get(
                "summary",
                "",
            )
            or ""
        )

        headline = str(
            canonical_resume.get(
                "headline",
                "",
            )
            or ""
        )

        candidate_context = infer_candidate_level(
            resume_text=resume_text,
            experience_entries=experience_entries,
            summary=summary,
            headline=headline,
        )

        candidate_level = candidate_context["candidate_level"]

        allowed_difficulties = {
            "fresher": {"Easy", "Medium"},
            "junior_experienced": {
                "Easy",
                "Medium",
                "Hard",
            },
            "experienced": {
                "Medium",
                "Hard",
            },
            "senior": {
                "Medium",
                "Hard",
            },
        }.get(
            candidate_level,
            {"Easy", "Medium"},
        )

        logger.info(
            "Mock interview context: "
            "resume_id=%s candidate_level=%s skills=%s "
            "projects=%d experience_entries=%d",
            active_resume.id,
            candidate_level,
            sorted(candidate_skills),
            len(projects),
            len(experience_entries),
        )

        answered_q_ids = {
            row[0]
            for row in (
                db.query(MockInterviewAnswer.question_id)
                .join(MockInterviewSession)
                .filter(
                    MockInterviewSession.user_id == user_id,
                    MockInterviewAnswer.question_id.isnot(None),
                )
                .all()
            )
        }

        intro_q = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.category == "Behavioral",
                InterviewQuestionBank.question.ilike("%introduce yourself%"),
            )
            .first()
        )

        if intro_q:
            intro_question = {
                "id": intro_q.id,
                "question": intro_q.question,
                "answer": intro_q.answer,
                "skill": intro_q.skill,
                "category": intro_q.category,
                "difficulty": intro_q.difficulty,
                "experience_level": candidate_level,
                "company": intro_q.company,
                "estimated_duration": "2-3 minutes",
            }
        else:
            intro_question = {
                "id": None,
                "question": (
                    "Can you introduce yourself and walk " "me through your background?"
                ),
                "answer": (
                    "Summarize your education, relevant "
                    "skills, actual projects or experience, "
                    "and current career goals."
                ),
                "skill": "HR Fundamentals",
                "category": "Behavioral",
                "difficulty": "Easy",
                "experience_level": candidate_level,
                "company": None,
                "estimated_duration": "2-3 minutes",
            }

        if projects:
            project = projects[0]

            project_title = (
                str(
                    project.get(
                        "title",
                        "",
                    )
                    or ""
                ).strip()
                or "your project"
            )

            technologies = [
                str(technology).strip()
                for technology in project.get(
                    "technologies",
                    [],
                )
                if str(technology).strip()
            ]

            technology_context = ""

            if technologies:
                technology_context = " using " + ", ".join(technologies[:4])

            project_question = {
                "id": None,
                "question": (
                    f"Walk me through {project_title}"
                    f"{technology_context}. "
                    "What problem did it solve, what was "
                    "your contribution, and what technical "
                    "challenge did you handle?"
                ),
                "answer": (
                    "Explain only verified project facts: "
                    "the problem, your contribution, the "
                    "technology choices, one challenge, "
                    "the solution, and the result."
                ),
                "skill": (technologies[0] if technologies else "Project"),
                "category": "Project Based",
                "difficulty": ("Hard" if candidate_level == "senior" else "Medium"),
                "experience_level": candidate_level,
                "company": None,
                "estimated_duration": "2-3 minutes",
            }

        else:
            if experience_entries:
                project_question = {
                    "id": None,
                    "question": (
                        "Choose one significant technical initiative "
                        "from your professional experience. Walk me "
                        "through the business problem, your specific "
                        "contribution, the architecture or technical "
                        "approach, the main trade-offs, and the "
                        "measurable outcome."
                    ),
                    "answer": (
                        "Use a verified initiative from your work "
                        "experience. Explain the context, your "
                        "ownership, technical decisions, constraints, "
                        "implementation, measurable result, and what "
                        "you would improve."
                    ),
                    "skill": "Professional Experience",
                    "category": "Project Based",
                    "difficulty": ("Hard" if candidate_level == "senior" else "Medium"),
                    "experience_level": candidate_level,
                    "company": None,
                    "estimated_duration": "3-5 minutes",
                }

            else:
                project_question = {
                    "id": None,
                    "question": (
                        "Describe one technical project or "
                        "practical assignment you completed. "
                        "What did you build, what was your "
                        "contribution, and what did you learn?"
                    ),
                    "answer": (
                        "Use a real project, academic assignment, "
                        "training exercise, or practical task. "
                        "Do not claim work you did not complete."
                    ),
                    "skill": "Project",
                    "category": "Project Based",
                    "difficulty": "Medium",
                    "experience_level": candidate_level,
                    "company": None,
                    "estimated_duration": "2-3 minutes",
                }

        technical_query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category.in_(
                [
                    "Technical",
                    "Coding",
                    "Theory",
                ]
            ),
            InterviewQuestionBank.difficulty.in_(allowed_difficulties),
        )

        if normalized_candidate_skills:
            technical_query = technical_query.filter(
                func.lower(InterviewQuestionBank.skill).in_(normalized_candidate_skills)
            )

        if answered_q_ids:
            technical_query = technical_query.filter(
                InterviewQuestionBank.id.notin_(answered_q_ids)
            )

        technical_pool = technical_query.order_by(func.random()).all()
        questions_by_skill = {}

        for question in technical_pool:
            normalized_skill = (question.skill or "Unknown").strip().lower()

            questions_by_skill.setdefault(
                normalized_skill,
                [],
            ).append(question)

        selected_technical = []
        selected_ids = set()

        skill_order = []

        domain_skill_groups = [
            {
                "machine learning",
            },
            {
                "nlp",
                "rag",
                "semantic search",
            },
            {
                "embeddings & vector search",
                "mlops",
                "pyspark",
            },
        ]

        # Select one available skill from each major
        # ML/Data domain group before supporting skills.
        for skill_group in domain_skill_groups:
            available_group_skills = [
                skill_name
                for skill_name in questions_by_skill
                if (
                    skill_name in skill_group
                    and skill_name not in skill_order
                )
            ]

            random.shuffle(
                available_group_skills
            )

            if available_group_skills:
                skill_order.append(
                    available_group_skills[0]
                )

        # Add all remaining matched skills in random
        # order. This preserves generic behavior for
        # non-ML resumes and provides supporting skills
        # such as Python, SQL, or FastAPI.
        remaining_skills = [
            skill_name
            for skill_name in questions_by_skill
            if skill_name not in skill_order
        ]

        random.shuffle(
            remaining_skills
        )

        skill_order.extend(
            remaining_skills
        )

        # First pass:
        # select one question from each distinct
        # matched skill before repeating a skill.
        for skill_name in skill_order:
            skill_questions = (
                questions_by_skill[
                    skill_name
                ]
            )

            if not skill_questions:
                continue

            question = (
                skill_questions.pop()
            )

            selected_technical.append(
                question
            )

            selected_ids.add(
                question.id
            )

            if len(
                selected_technical
            ) == 4:
                break

        # Second pass:
        # fill remaining positions while allowing
        # a maximum of two questions per skill.
        if len(selected_technical) < 4:
            selected_skill_counts = {}

            for question in selected_technical:
                skill_key = (question.skill or "Unknown").strip().lower()

                selected_skill_counts[skill_key] = (
                    selected_skill_counts.get(
                        skill_key,
                        0,
                    )
                    + 1
                )

            remaining_pool = [
                question
                for question in technical_pool
                if question.id not in selected_ids
            ]

            random.shuffle(remaining_pool)

            for question in remaining_pool:
                skill_key = (question.skill or "Unknown").strip().lower()

                if (
                    selected_skill_counts.get(
                        skill_key,
                        0,
                    )
                    >= 2
                ):
                    continue

                selected_technical.append(question)

                selected_ids.add(question.id)

                selected_skill_counts[skill_key] = (
                    selected_skill_counts.get(
                        skill_key,
                        0,
                    )
                    + 1
                )

                if len(selected_technical) == 4:
                    break

        logger.info(
            "Selected mock interview technical " "skills: %s",
            [question.skill for question in selected_technical],
        )

        technical_questions = [
            {
                "id": question.id,
                "question": question.question,
                "answer": question.answer,
                "skill": question.skill,
                "category": question.category,
                "difficulty": question.difficulty,
                "experience_level": (question.experience_level),
                "company": question.company,
                "estimated_duration": "2-3 minutes",
            }
            for question in selected_technical[:4]
        ]

        if not technical_questions:
            logger.warning(
                "No active-resume skill-matched technical "
                "questions found for resume ID %s.",
                active_resume.id,
            )

        if candidate_level == "fresher":
            scenario_templates = [
                {
                    "question": (
                        "You find a bug in a project shortly "
                        "before a deadline. How would you "
                        "investigate, prioritize, and "
                        "communicate the issue?"
                    ),
                    "answer": (
                        "Reproduce the issue, inspect relevant "
                        "logs or code, isolate the cause, "
                        "prioritize impact, communicate early, "
                        "test the fix, and document the result."
                    ),
                    "skill": "Problem Solving",
                },
                {
                    "question": (
                        "You are asked to use an unfamiliar "
                        "technology in a project. How would "
                        "you learn it and deliver the task?"
                    ),
                    "answer": (
                        "Clarify the requirement, use official "
                        "documentation, build a small proof of "
                        "concept, ask focused questions, and "
                        "validate the implementation."
                    ),
                    "skill": "Adaptability",
                },
            ]

        elif candidate_level == "junior_experienced":
            scenario_templates = [
                {
                    "question": (
                        "A feature works locally but fails "
                        "after deployment. How would you "
                        "investigate and resolve it?"
                    ),
                    "answer": (
                        "Compare environments, inspect logs "
                        "and configuration, reproduce safely, "
                        "isolate the cause, test the fix, and "
                        "monitor after deployment."
                    ),
                    "skill": "Debugging",
                },
                {
                    "question": (
                        "A task estimate is likely to slip. "
                        "How would you manage the technical "
                        "work and stakeholder expectations?"
                    ),
                    "answer": (
                        "Identify the blocker, reassess scope, "
                        "communicate early, propose options, "
                        "prioritize critical work, and provide "
                        "a revised evidence-based estimate."
                    ),
                    "skill": "Time Management",
                },
            ]

        else:
            scenario_templates = [
                {
                    "question": (
                        "A production service is experiencing "
                        "higher latency. How would you "
                        "diagnose the bottleneck and reduce "
                        "risk while applying a fix?"
                    ),
                    "answer": (
                        "Use metrics, logs, and traces to "
                        "isolate the bottleneck, mitigate user "
                        "impact, validate the fix, deploy "
                        "safely, and monitor recovery."
                    ),
                    "skill": "System Design",
                },
                {
                    "question": (
                        "Your team must make a significant "
                        "technical trade-off under a delivery "
                        "deadline. How would you evaluate and "
                        "communicate the decision?"
                    ),
                    "answer": (
                        "Define constraints, compare options, "
                        "document trade-offs and risks, align "
                        "stakeholders, choose a reversible "
                        "path where possible, and define "
                        "follow-up work."
                    ),
                    "skill": "Technical Leadership",
                },
            ]

        scenario_questions = [
            {
                "id": None,
                "question": item["question"],
                "answer": item["answer"],
                "skill": item["skill"],
                "category": "Scenario Based",
                "difficulty": ("Hard" if candidate_level == "senior" else "Medium"),
                "experience_level": candidate_level,
                "company": None,
                "estimated_duration": "2-3 minutes",
            }
            for item in scenario_templates
        ]

        return (
            [intro_question, project_question]
            + technical_questions
            + scenario_questions
        )


mock_interview_service = MockInterviewService()
