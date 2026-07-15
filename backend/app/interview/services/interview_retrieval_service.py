import logging
from sqlalchemy import func
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
    normalized_resume_skills = {
        skill.strip().lower() for skill in resume_skills if skill and skill.strip()
    }

    normalized_jd_skills = {
        skill.strip().lower() for skill in jd_skills if skill and skill.strip()
    }

    matched_skills = normalized_resume_skills & normalized_jd_skills

    target_skills = matched_skills if matched_skills else normalized_resume_skills

    logger.info(
        "Number of skills extracted from resume: %d",
        len(normalized_resume_skills),
    )
    logger.info(
        "Number of skills extracted from job description: %d",
        len(normalized_jd_skills),
    )
    logger.info(
        "Candidate-supported target skills: %s",
        sorted(target_skills),
    )

    if not target_skills:
        logger.warning(
            "No supported skills were extracted from the active resume. "
            "Skipping question retrieval."
        )
        return []

    query = "Candidate Resume Skills: " + ", ".join(sorted(target_skills))

    logger.info(
        "Query sent to Qdrant:\n%s",
        query,
    )

    try:
        question_ids = search_question_ids(
            query=query,
            limit=max(
                limit * 3,
                limit,
            ),
        )

        if not isinstance(
            question_ids,
            list,
        ):
            logger.warning(
                "Qdrant returned an unexpected "
                "question ID result type. "
                "Using SQL fallback."
            )
            question_ids = []

    except Exception:
        logger.warning(
            "Qdrant question retrieval failed. "
            "Using SQL skill-matched fallback.",
            exc_info=True,
        )
        question_ids = []

    logger.info(
        "Number of retrieved question IDs: %d",
        len(question_ids),
    )

    questions_by_id = {}

    if question_ids:
        rows = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.id.in_(question_ids),
                func.lower(InterviewQuestionBank.skill).in_(target_skills),
            )
            .all()
        )

        questions_by_id = {question.id: question for question in rows}

    questions = [
        questions_by_id[question_id]
        for question_id in question_ids
        if question_id in questions_by_id
    ][:limit]

    if len(questions) < limit:
        existing_ids = {question.id for question in questions}

        remaining_needed = limit - len(questions)

        fallback_query = db.query(InterviewQuestionBank).filter(
            func.lower(InterviewQuestionBank.skill).in_(target_skills)
        )

        if existing_ids:
            fallback_query = fallback_query.filter(
                ~InterviewQuestionBank.id.in_(existing_ids)
            )

        fallback_questions = (
            fallback_query.order_by(
                InterviewQuestionBank.id.desc(),
            )
            .limit(remaining_needed)
            .all()
        )

        questions.extend(fallback_questions)

        logger.info(
            "Added %d active-resume skill-matched " "questions from SQL fallback.",
            len(fallback_questions),
        )

    logger.info(
        "Returning %d candidate-relevant questions.",
        len(questions),
    )

    return questions
