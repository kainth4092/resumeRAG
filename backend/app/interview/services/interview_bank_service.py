import logging

from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.schemas.interview_bank import (
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
)
from app.services.qdrant_service import upsert_question, delete_question_vector
from app.interview.repository.question_bank_repository import QuestionBankRepository


logger = logging.getLogger(__name__)


def classify_difficulty(question_text: str, experience_level: str, skill: str) -> str:
    question_lower = question_text.lower()
    exp_lower = experience_level.lower()
    skill_lower = skill.lower()

    # 1. Technical Depth and Complexity Keywords (Immediate Hard)
    hard_keywords = [
        "vacuum",
        "garbage collection",
        "gil",
        "global interpreter lock",
        "concurrency",
        "deadlock",
        "race condition",
        "internals",
        "under the hood",
        "memory management",
        "thread safety",
        "semaphores",
        "profiler",
        "memory leak",
        "metaclass",
        "descriptor",
        "event loop",
        "query optimization",
        "explain analyze",
        "sharding",
        "replication",
        "distributed",
        "cap theorem",
        "horizontal scaling",
        "load balancing",
        "b-tree",
        "microservices orchestration",
        "kubernetes pod internals",
    ]
    if any(kw in question_lower for kw in hard_keywords):
        return "Hard"

    # 2. Experience Level Mapping
    # Hard Indicators
    hard_exp = [
        "senior",
        "lead",
        "advanced",
        "hard",
        "5+",
        "5-",
        "6+",
        "7+",
        "8+",
        "10+",
        "expert",
        "architect",
        "principal",
    ]
    if any(kw in exp_lower for kw in hard_exp):
        return "Hard"

    # Easy Indicators
    easy_exp = [
        "fresher",
        "junior",
        "easy",
        "0-2",
        "0-1",
        "1-2",
        "entry",
        "basic",
        "beginner",
    ]
    if any(kw in exp_lower for kw in easy_exp):
        return "Easy"

    # Medium Indicators
    medium_exp = ["mid", "intermediate", "medium", "3-5", "2-3", "2-4", "3-4", "4-5"]
    if any(kw in exp_lower for kw in medium_exp):
        return "Medium"

    # 3. Topic Complexity
    medium_keywords = [
        "architecture",
        "decorator",
        "iterator",
        "generator",
        "middleware",
        "index",
        "security",
        "jwt",
        "oauth",
        "docker",
        "pipeline",
        "cicd",
        "testing",
        "mock",
        "transaction",
        "foreign key",
    ]
    if any(kw in question_lower for kw in medium_keywords):
        return "Medium"

    # Default Fallback
    return "Medium"


def generate_and_update_answer_task(
    question_id: int,
    question_text: str,
    skill: str,
    category: str,
    experience_level: str,
):
    from app.core.database import SessionLocal
    from app.services.llm_service import generate_general_answer
    from app.services.qdrant_service import upsert_question
    from app.models.interview_bank import InterviewQuestionBank

    db = SessionLocal()
    try:
        answer_text = generate_general_answer(
            question=question_text,
            skill=skill,
            category=category,
            experience_level=experience_level,
        )

        question = (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.id == question_id)
            .first()
        )
        if question:
            question.answer = answer_text
            db.commit()
            db.refresh(question)
            try:
                upsert_question(
                    question,
                    force_update=True,
                )
            except Exception as q_err:
                logger.warning(
                    "Qdrant sync failed after generated answer "
                    "for question ID %s: %s",
                    question.id,
                    q_err,
                )
    except Exception:
        logger.exception(
            "Background answer generation failed for question %s", question_id
        )
    finally:
        db.close()


def create_question(
    db: Session,
    payload: InterviewQuestionCreate,
    created_by: int | None = None,
    background_tasks=None,
):
    answer_text = payload.answer
    generate_in_background = False

    if not answer_text or not answer_text.strip():
        answer_text = "Generating answer..."
        generate_in_background = True

    difficulty = classify_difficulty(
        payload.question, payload.experience_level, payload.skill
    )

    question = InterviewQuestionBank(
        question=payload.question,
        answer=answer_text,
        skill=payload.skill,
        category=payload.category,
        experience_level=payload.experience_level,
        difficulty=difficulty,
        company=payload.company,
        role=payload.role,
        tags=payload.tags,
        source="Community" if created_by else "Admin",
        created_by=created_by,
    )

    saved_question = QuestionBankRepository.create_question(db, question)

    if generate_in_background:
        if background_tasks:
            background_tasks.add_task(
                generate_and_update_answer_task,
                question_id=saved_question.id,
                question_text=saved_question.question,
                skill=saved_question.skill,
                category=saved_question.category,
                experience_level=saved_question.experience_level,
            )
        else:
            # Fallback to synchronous if background_tasks is not provided (e.g. tests or admin script)
            from app.services.llm_service import generate_general_answer

            try:
                ans = generate_general_answer(
                    question=saved_question.question,
                    skill=saved_question.skill,
                    category=saved_question.category,
                    experience_level=saved_question.experience_level,
                )
                saved_question.answer = ans
                db.commit()
                db.refresh(saved_question)
            except Exception as e:
                logger.warning("Fallback answer generation failed: %s", e)

    try:
        upsert_question(saved_question)
    except Exception as e:
        logger.warning("Qdrant sync failed: %s", e)

    return saved_question


def get_question(
    db: Session,
    question_id: int,
):
    return QuestionBankRepository.get_question(db, question_id)


def get_question_by_id(
    db: Session,
    question_id: int,
):
    return QuestionBankRepository.get_question(db, question_id)


def update_question(
    db: Session,
    question: InterviewQuestionBank,
    payload: InterviewQuestionUpdate,
):
    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(question, key, value)

    # Reclassify difficulty based on updated fields
    question.difficulty = classify_difficulty(
        question.question, question.experience_level, question.skill
    )

    db.commit()
    db.refresh(question)
    try:
        upsert_question(
            question,
            force_update=True,
        )
    except Exception as exc:
        logger.warning(
            "Question ID %s was updated in SQL, "
            "but Qdrant synchronization failed: %s",
            question.id,
            exc,
        )

    return question


def delete_question(
    db: Session,
    question: InterviewQuestionBank,
):
    question_id = question.id
    QuestionBankRepository.delete_question(
        db,
        question,
    )
    try:
        delete_question_vector(question_id)
    except Exception as exc:
        logger.warning(
            "Question ID %s was deleted from SQL, "
            "but its Qdrant vector could not be deleted: %s",
            question_id,
            exc,
        )


def list_questions(
    db: Session,
    skill: str | None = None,
    category: str | None = None,
    experience_level: str | None = None,
    difficulty: str | None = None,
    company: str | None = None,
    source: str | None = None,
    search: str | None = None,
    bookmark_only: bool = False,
    user_id: int | None = None,
    skip: int = 0,
    limit: int = 20,
):
    return QuestionBankRepository.list_questions(
        db,
        skill=skill,
        category=category,
        experience_level=experience_level,
        difficulty=difficulty,
        company=company,
        source=source,
        search=search,
        bookmark_only=bookmark_only,
        user_id=user_id,
        skip=skip,
        limit=limit,
    )


def get_filters_meta(
    db: Session,
    user_id: int | None = None,
    skill: str | None = None,
    category: str | None = None,
    experience_level: str | None = None,
    difficulty: str | None = None,
    company: str | None = None,
    source: str | None = None,
    search: str | None = None,
    bookmark_only: bool = False,
):
    from sqlalchemy import func
    from app.models.bookmark import InterviewBookmark

    query = db.query(InterviewQuestionBank)

    if bookmark_only and user_id:
        query = query.join(
            InterviewBookmark, InterviewBookmark.question_id == InterviewQuestionBank.id
        ).filter(InterviewBookmark.user_id == user_id)

    if source:
        query = query.filter(InterviewQuestionBank.source.ilike(source))
    if skill:
        query = query.filter(InterviewQuestionBank.skill.ilike(skill))
    if category:
        query = query.filter(InterviewQuestionBank.category.ilike(category))
    if experience_level:
        query = query.filter(
            InterviewQuestionBank.experience_level.ilike(experience_level)
        )
    if company:
        query = query.filter(InterviewQuestionBank.company.ilike(company))
    if difficulty:
        query = query.filter(InterviewQuestionBank.difficulty.ilike(difficulty))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            InterviewQuestionBank.question.ilike(search_pattern)
            | InterviewQuestionBank.answer.ilike(search_pattern)
        )

    subquery = query.subquery()

    # Group by skill
    skills_raw = (
        db.query(subquery.c.skill, func.count(subquery.c.id))
        .group_by(subquery.c.skill)
        .all()
    )
    skills = [{"name": s, "count": c} for s, c in skills_raw if s]

    # Group by category
    categories_raw = (
        db.query(subquery.c.category, func.count(subquery.c.id))
        .group_by(subquery.c.category)
        .all()
    )
    categories = [{"name": cat, "count": c} for cat, c in categories_raw if cat]

    # Group by company
    companies_raw = (
        db.query(subquery.c.company, func.count(subquery.c.id))
        .group_by(subquery.c.company)
        .all()
    )
    companies = [{"name": comp, "count": c} for comp, c in companies_raw if comp]

    # Group by difficulty
    diff_raw = (
        db.query(subquery.c.difficulty, func.count(subquery.c.id))
        .group_by(subquery.c.difficulty)
        .all()
    )

    difficulties = {"Easy": 0, "Medium": 0, "Hard": 0}
    for diff_val, c in diff_raw:
        if diff_val:
            normalized = diff_val.capitalize()
            if normalized in difficulties:
                difficulties[normalized] = c

    # Bookmarks count
    bookmarks_count = 0
    bookmarks_count = 0

    if user_id:
        bookmarks_count = (
            db.query(func.count(func.distinct(subquery.c.id)))
            .join(
                InterviewBookmark,
                InterviewBookmark.question_id == subquery.c.id,
            )
            .filter(InterviewBookmark.user_id == user_id)
            .scalar()
            or 0
        )
    return {
        "skills": skills,
        "categories": categories,
        "companies": companies,
        "difficulties": difficulties,
        "bookmarks_count": bookmarks_count,
    }
