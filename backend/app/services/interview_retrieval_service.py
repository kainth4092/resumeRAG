import logging
from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.services.qdrant_service import search_question_ids

logger = logging.getLogger(__name__)

SKILLS = [
    "React",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Python",
    "FastAPI",
    "Flask",
    "Django",
    "PostgreSQL",
    "SQL",
    "Docker",
    "Git",
    "GitHub",
    "JWT",
    "REST API",
    "Redis",
    "Qdrant",
    "LangChain",
    "LangGraph",
]


def extract_resume_skills(resume_text: str):
    if not resume_text:
        return []
    found = []
    resume = resume_text.lower()
    for skill in SKILLS:
        if skill.lower() in resume:
            found.append(skill)

    return found


def extract_jd_skills(job_description: str):
    if not job_description:
        return []
    found = []
    jd = job_description.lower()
    for skill in SKILLS:
        if skill.lower() in jd:
            found.append(skill)

    return found


def retrieve_questions_rag(
    db: Session,
    resume_skills: list[str],
    jd_skills: list[str],
    limit: int = 40,
):
    logger.info("Number of skills extracted from resume: %d", len(resume_skills))
    logger.info("Number of skills extracted from job description: %d", len(jd_skills))

    query_parts = []
    if resume_skills:
        query_parts.append(f"Resume Skills: {', '.join(resume_skills)}")
    if jd_skills:
        query_parts.append(f"Job Description Skills: {', '.join(jd_skills)}")

    query = "\n\n".join(query_parts) if query_parts else "General Interview Preparation"

    logger.info("Query sent to Qdrant:\n%s", query)

    question_ids = search_question_ids(query=query, limit=limit)

    logger.info("Number of retrieved question IDs: %d", len(question_ids))

    questions = []
    if question_ids:
        questions = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.id.in_(question_ids),
            )
            .all()
        )

    if not questions:
        logger.warning(
            "Fallback usage triggered: Qdrant returned no results or matching database records."
        )
        questions = db.query(InterviewQuestionBank).limit(limit).all()
        logger.info("Retrieved %d questions from database fallback.", len(questions))

    return questions
