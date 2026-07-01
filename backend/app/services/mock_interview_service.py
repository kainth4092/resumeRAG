import logging
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, or_
from app.models.interview_bank import InterviewQuestionBank
from app.models.mock_interview import MockInterviewAnswer, MockInterviewSession

logger = logging.getLogger(__name__)

# Predefined high-quality behavioral/HR questions to auto-seed in the database
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
        interview_type: str,
        user_id: Optional[int] = None,
        count: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves a balanced set of 5 questions prioritizing unseen questions.
        """
        logger.info(
            f"Retrieving balanced questions for mock type: {interview_type} (user_id: {user_id})"
        )

        # Ensure database has behavioral questions seeded
        self._ensure_behavioral_questions(db)

        # 1. Fetch previously answered questions to avoid duplicates
        answered_q_ids = []
        if user_id:
            try:
                answered_q_ids = [
                    r[0]
                    for r in db.query(MockInterviewAnswer.question_id)
                    .join(MockInterviewSession)
                    .filter(
                        MockInterviewSession.user_id == user_id,
                        MockInterviewAnswer.question_id.isnot(None),
                    )
                    .all()
                ]
            except Exception as e:
                logger.error(f"Error fetching answered questions: {e}")

        type_lower = interview_type.lower()
        selected_questions = []

        try:
            if "technical" in type_lower:
                selected_questions = self._get_balanced_technical(db, answered_q_ids)
            elif "hr" in type_lower:
                selected_questions = self._get_balanced_hr(db, answered_q_ids)
            elif "project" in type_lower:
                selected_questions = self._get_balanced_project(db, answered_q_ids)
            else:
                selected_questions = self._get_balanced_behavioral(db, answered_q_ids)

            # Map the interview type to corresponding DB categories for filling fallbacks
            fallback_categories = [
                "Technical",
                "Database",
                "Security",
                "AI/ML",
                "Coding",
            ]
            if "hr" in type_lower or "behavioral" in type_lower:
                fallback_categories = ["Behavioral"]
            elif "project" in type_lower:
                fallback_categories = ["Project Based", "Project\nBased", "Project"]

            if len(selected_questions) < count:
                needed = count - len(selected_questions)
                existing_ids = [q.id for q in selected_questions]

                for prioritize_unseen in [True, False]:
                    fill_query = db.query(InterviewQuestionBank).filter(
                        InterviewQuestionBank.category.in_(fallback_categories)
                    )
                    if existing_ids:
                        fill_query = fill_query.filter(
                            InterviewQuestionBank.id.notin_(existing_ids)
                        )

                    if prioritize_unseen and answered_q_ids:
                        fill_query = fill_query.filter(
                            InterviewQuestionBank.id.notin_(answered_q_ids)
                        )

                    extra = fill_query.order_by(func.random()).limit(needed).all()
                    selected_questions.extend(extra)
                    existing_ids.extend([q.id for q in extra])
                    needed = count - len(selected_questions)
                    if needed <= 0:
                        break

            formatted = []
            for q in selected_questions[:count]:
                formatted.append(
                    {
                        "id": q.id,
                        "question": q.question,
                        "answer": q.answer,
                        "skill": q.skill,
                        "category": q.category,
                        "experience_level": q.experience_level,
                        "company": q.company,
                        "estimated_duration": "2-3 minutes",
                    }
                )

            return formatted

        except Exception as e:
            logger.error(f"Error selecting balanced questions: {e}")
            # Absolute fallback matching the category type
            fallback_categories = [
                "Technical",
                "Database",
                "Security",
                "AI/ML",
                "Coding",
            ]
            if "hr" in type_lower or "behavioral" in type_lower:
                fallback_categories = ["Behavioral"]
            elif "project" in type_lower:
                fallback_categories = ["Project Based", "Project\nBased", "Project"]

            fallback_qs = (
                db.query(InterviewQuestionBank)
                .filter(InterviewQuestionBank.category.in_(fallback_categories))
                .order_by(func.random())
                .limit(count)
                .all()
            )
            return [
                {
                    "id": q.id,
                    "question": q.question,
                    "answer": q.answer,
                    "skill": q.skill,
                    "category": q.category,
                    "experience_level": q.experience_level,
                    "company": q.company,
                    "estimated_duration": "2-3 minutes",
                }
                for q in fallback_qs
            ]

    def _get_balanced_technical(
        self, db: Session, answered_ids: List[int]
    ) -> List[InterviewQuestionBank]:
        """
        Technical Interview: 1 Easy, 2 Medium, 2 Hard
        """
        easy_terms = ["beginner", "entry-level", "easy", "junior"]
        med_terms = ["intermediate", "medium", "mid-level"]
        hard_terms = ["senior", "advanced", "hard", "architect"]

        result = []
        # 1 Easy
        q_easy = self._query_with_fallback(
            db,
            category="Technical",
            difficulty_list=easy_terms,
            answered_ids=answered_ids,
            limit=1,
        )
        result.extend(q_easy)

        # 2 Medium
        q_medium = self._query_with_fallback(
            db,
            category="Technical",
            difficulty_list=med_terms,
            answered_ids=answered_ids,
            limit=2,
        )
        result.extend(q_medium)

        # 2 Hard
        q_hard = self._query_with_fallback(
            db,
            category="Technical",
            difficulty_list=hard_terms,
            answered_ids=answered_ids,
            limit=2,
        )
        result.extend(q_hard)

        return result

    def _get_balanced_hr(
        self, db: Session, answered_ids: List[int]
    ) -> List[InterviewQuestionBank]:
        """
        HR Interview: Introduction, Behavioral, Conflict, Leadership, Future Goals
        """
        result = []
        topics = [
            ("Introduction", ["introduce", "yourself", "background", "career summary"]),
            (
                "Behavioral",
                [
                    "tell me about a time",
                    "situation",
                    "behavioral",
                    "strength",
                    "weakness",
                ],
            ),
            ("Conflict", ["conflict", "disagree", "difficult coworker", "criticism"]),
            ("Leadership", ["lead", "leadership", "initiative", "mentor", "guide"]),
            (
                "Future Goals",
                ["future", "goals", "career", "5 years", "why this company"],
            ),
        ]

        for topic_name, keywords in topics:
            q_list = self._query_topic_with_fallback(
                db,
                category="Behavioral",
                keywords=keywords,
                answered_ids=answered_ids,
                exclude_ids=[q.id for q in result],
                limit=1,
            )
            result.extend(q_list)

        return result

    def _get_balanced_project(
        self, db: Session, answered_ids: List[int]
    ) -> List[InterviewQuestionBank]:
        """
        Project Interview: Architecture, Challenges, Database, Performance, Deployment
        """
        result = []
        topics = [
            ("Architecture", ["architecture", "structure", "design", "system design"]),
            ("Challenges", ["challenge", "difficult", "problem", "bug", "stuck"]),
            ("Database", ["database", "postgres", "nosql", "sql", "schema", "query"]),
            (
                "Performance",
                ["performance", "optimize", "speed", "scale", "bottleneck", "cache"],
            ),
            ("Deployment", ["deploy", "ci/cd", "docker", "cloud", "aws", "production"]),
        ]

        for topic_name, keywords in topics:
            q_list = self._query_topic_with_fallback(
                db,
                category="Project",
                keywords=keywords,
                answered_ids=answered_ids,
                exclude_ids=[q.id for q in result],
                limit=1,
            )
            result.extend(q_list)

        return result

    def _get_balanced_behavioral(
        self, db: Session, answered_ids: List[int]
    ) -> List[InterviewQuestionBank]:
        """
        Behavioral: general standard behavioral questions
        """
        query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category == "Behavioral"
        )
        unseen_query = query.filter(InterviewQuestionBank.id.notin_(answered_ids))
        questions = unseen_query.order_by(func.random()).limit(5).all()
        if len(questions) < 5:
            questions = query.order_by(func.random()).limit(5).all()
        return questions

    def _query_with_fallback(
        self,
        db: Session,
        category: str,
        difficulty_list: List[str],
        answered_ids: List[int],
        limit: int,
    ) -> List[InterviewQuestionBank]:
        # Map category names flexibly
        categories = [category]
        if category == "Project":
            categories = ["Project Based", "Project\nBased", "Project"]
        elif category == "Behavioral":
            categories = ["Behavioral"]
        elif category == "Technical":
            categories = [
                "Technical",
                "Database",
                "Security",
                "AI/ML",
                "Coding",
                "Scenario Based",
                "Scenario\nBased",
            ]

        # Filter questions matching criteria
        base_query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category.in_(categories),
            InterviewQuestionBank.experience_level.in_(difficulty_list),
        )

        # Try unseen first
        unseen_q = (
            base_query.filter(InterviewQuestionBank.id.notin_(answered_ids))
            .order_by(func.random())
            .limit(limit)
            .all()
        )
        if len(unseen_q) >= limit:
            return unseen_q

        # Fall back to any questions including seen
        return base_query.order_by(func.random()).limit(limit).all()

    def _query_topic_with_fallback(
        self,
        db: Session,
        category: str,
        keywords: List[str],
        answered_ids: List[int],
        exclude_ids: List[int],
        limit: int,
    ) -> List[InterviewQuestionBank]:
        # Map category names flexibly
        categories = [category]
        if category == "Project":
            categories = ["Project Based", "Project\nBased", "Project"]
        elif category == "Behavioral":
            categories = ["Behavioral"]
        elif category == "Technical":
            categories = [
                "Technical",
                "Database",
                "Security",
                "AI/ML",
                "Coding",
                "Scenario Based",
                "Scenario\nBased",
            ]

        # Create keyword search filters
        keyword_filters = [
            InterviewQuestionBank.question.ilike(f"%{kw}%") for kw in keywords
        ]

        base_query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category.in_(categories)
        )
        if exclude_ids:
            base_query = base_query.filter(InterviewQuestionBank.id.notin_(exclude_ids))

        # Filter by keywords
        keyword_query = base_query.filter(or_(*keyword_filters))

        # Unseen + keywords
        unseen_kw = (
            keyword_query.filter(InterviewQuestionBank.id.notin_(answered_ids))
            .order_by(func.random())
            .limit(limit)
            .all()
        )
        if len(unseen_kw) >= limit:
            return unseen_kw

        # Any + keywords
        kw_q = keyword_query.order_by(func.random()).limit(limit).all()
        if len(kw_q) >= limit:
            return kw_q

        # Unseen in category (no keywords)
        unseen_cat = (
            base_query.filter(InterviewQuestionBank.id.notin_(answered_ids))
            .order_by(func.random())
            .limit(limit)
            .all()
        )
        if len(unseen_cat) >= limit:
            return unseen_cat

        # Any in category
        return base_query.order_by(func.random()).limit(limit).all()


# Singleton instance
mock_interview_service = MockInterviewService()
