import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.models.interview_bank import InterviewQuestionBank
from app.models.mock_interview import MockInterviewAnswer, MockInterviewSession

logger = logging.getLogger(__name__)

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
        interview_type: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generates a balanced mock interview sequence containing 8 questions:
        1. 1 Introduction question (typically fixed or selected from behavioral)
        2. 1 Project-based question
        3. 4 Skill/technical-based questions
        4. 2 Scenario-based questions

        Ensures questions are random and change every time (except introduction)
        by avoiding questions the user has already answered.
        """
        logger.info(
            f"Retrieving balanced real voice interview questions (user_id: {user_id})"
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

        # --- Phase 1: Introduction (1 question) ---
        intro_q = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.category == "Behavioral",
                InterviewQuestionBank.question.ilike("%introduce yourself%"),
            )
            .first()
        )

        if not intro_q:
            intro_q = (
                db.query(InterviewQuestionBank)
                .filter(
                    InterviewQuestionBank.category == "Behavioral",
                    InterviewQuestionBank.question.ilike("%background%"),
                )
                .first()
            )

        if not intro_q:
            intro_q_dict = {
                "id": None,
                "question": "Can you introduce yourself and walk me through your background?",
                "answer": "Provide a brief 2-minute elevator pitch summarizing your education, core technical skills, key projects/achievements, and interest in this role.",
                "skill": "HR Fundamentals",
                "category": "Behavioral",
                "experience_level": "Fresher",
                "company": None,
                "estimated_duration": "2-3 minutes",
            }
        else:
            intro_q_dict = {
                "id": intro_q.id,
                "question": intro_q.question,
                "answer": intro_q.answer,
                "skill": intro_q.skill,
                "category": intro_q.category,
                "experience_level": intro_q.experience_level,
                "company": intro_q.company,
                "estimated_duration": "2-3 minutes",
            }

        # --- Phase 2: Project-based (1 question) ---
        project_q_candidates = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category.in_(
                ["Project", "Project Based", "Project\nBased"]
            )
        )

        unseen_projects = (
            project_q_candidates.filter(InterviewQuestionBank.id.notin_(answered_q_ids))
            .order_by(func.random())
            .limit(1)
            .all()
        )

        if unseen_projects:
            project_q = unseen_projects[0]
        else:
            fallback_projects = (
                project_q_candidates.order_by(func.random()).limit(1).all()
            )
            if fallback_projects:
                project_q = fallback_projects[0]
            else:
                project_q = None

        if not project_q:
            project_q = (
                db.query(InterviewQuestionBank)
                .filter(
                    InterviewQuestionBank.category == "Behavioral",
                    InterviewQuestionBank.question.ilike("%project%"),
                )
                .order_by(func.random())
                .first()
            )

        if not project_q:
            project_q_dict = {
                "id": None,
                "question": "Describe a difficult project challenge you faced and how you overcame it.",
                "answer": "Explain the technical or team constraint, your plan of action, the implementation details, and what you successfully delivered.",
                "skill": "Problem Solving",
                "category": "Project Based",
                "experience_level": "Intermediate",
                "company": None,
                "estimated_duration": "2-3 minutes",
            }
        else:
            project_q_dict = {
                "id": project_q.id,
                "question": project_q.question,
                "answer": project_q.answer,
                "skill": project_q.skill,
                "category": project_q.category,
                "experience_level": project_q.experience_level,
                "company": project_q.company,
                "estimated_duration": "2-3 minutes",
            }

        # --- Phase 3: Skills (4 questions) ---
        tech_q_candidates = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category == "Technical"
        )

        unseen_techs = (
            tech_q_candidates.filter(InterviewQuestionBank.id.notin_(answered_q_ids))
            .order_by(func.random())
            .limit(4)
            .all()
        )

        selected_techs = list(unseen_techs)

        if len(selected_techs) < 4:
            needed = 4 - len(selected_techs)
            answered_q_ids + [q.id for q in selected_techs]
            extra_techs = (
                tech_q_candidates.filter(
                    InterviewQuestionBank.id.notin_([q.id for q in selected_techs])
                )
                .order_by(func.random())
                .limit(needed)
                .all()
            )
            selected_techs.extend(extra_techs)

        tech_qs_list = []
        for q in selected_techs:
            tech_qs_list.append(
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

        if not tech_qs_list:
            default_techs = [
                {
                    "question": "What is a closure in JavaScript?",
                    "answer": "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).",
                    "skill": "JavaScript",
                },
                {
                    "question": "What is the Global Interpreter Lock (GIL) in Python?",
                    "answer": "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once.",
                    "skill": "Python",
                },
                {
                    "question": "What is the difference between SQL and NoSQL databases?",
                    "answer": "SQL databases are relational, table-based, and have predefined schemas. NoSQL databases are non-relational, document or key-value based, and have dynamic schemas.",
                    "skill": "Databases",
                },
                {
                    "question": "What is a RESTful API and how does it work?",
                    "answer": "A RESTful API is an architectural style for an application programming interface (API) that uses HTTP requests to GET, PUT, POST and DELETE data.",
                    "skill": "APIs",
                },
            ]
            for item in default_techs:
                tech_qs_list.append(
                    {
                        "id": None,
                        "question": item["question"],
                        "answer": item["answer"],
                        "skill": item["skill"],
                        "category": "Technical",
                        "experience_level": "Intermediate",
                        "company": None,
                        "estimated_duration": "2-3 minutes",
                    }
                )

        # --- Phase 4: Scenario-based (2 questions) ---
        scenario_q_candidates = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.category.in_(
                ["Scenario Based", "Scenario\nBased", "Scenario"]
            )
        )

        unseen_scenarios = (
            scenario_q_candidates.filter(
                InterviewQuestionBank.id.notin_(answered_q_ids)
            )
            .order_by(func.random())
            .limit(2)
            .all()
        )

        selected_scenarios = list(unseen_scenarios)

        if len(selected_scenarios) < 2:
            needed = 2 - len(selected_scenarios)
            extra_scenarios = (
                scenario_q_candidates.filter(
                    InterviewQuestionBank.id.notin_([q.id for q in selected_scenarios])
                )
                .order_by(func.random())
                .limit(needed)
                .all()
            )
            selected_scenarios.extend(extra_scenarios)

        scenario_qs_list = []
        for q in selected_scenarios:
            scenario_qs_list.append(
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

        if not scenario_qs_list:
            default_scenarios = [
                {
                    "question": "How would you handle a sudden traffic spike on your web application that causes database latency?",
                    "answer": "Introduce caching (e.g. Redis), scale the application horizontally, optimize slow queries, or use read-replicas for the database.",
                    "skill": "System Design",
                },
                {
                    "question": "Your production deployment just failed and users are seeing 500 errors. What is your immediate action plan?",
                    "answer": "Roll back to the last stable deployment immediately, check error logs, identify the root cause, and apply a hotfix after testing locally.",
                    "skill": "DevOps",
                },
            ]
            for item in default_scenarios:
                scenario_qs_list.append(
                    {
                        "id": None,
                        "question": item["question"],
                        "answer": item["answer"],
                        "skill": item["skill"],
                        "category": "Scenario Based",
                        "experience_level": "Advanced",
                        "company": None,
                        "estimated_duration": "2-3 minutes",
                    }
                )

        return [intro_q_dict, project_q_dict] + tech_qs_list[:4] + scenario_qs_list[:2]


mock_interview_service = MockInterviewService()
