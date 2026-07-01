from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.schemas.interview_bank import (
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
)
from app.services.qdrant_service import upsert_question, delete_question_vector
from app.interview.repository.question_bank_repository import QuestionBankRepository


def create_question(
    db: Session,
    payload: InterviewQuestionCreate,
    created_by: int | None = None,
):
    answer_text = payload.answer
    if not answer_text or not answer_text.strip():
        from app.services.llm_service import generate_general_answer

        answer_text = generate_general_answer(
            question=payload.question,
            skill=payload.skill,
            category=payload.category,
            experience_level=payload.experience_level,
        )

    question = InterviewQuestionBank(
        question=payload.question,
        answer=answer_text,
        skill=payload.skill,
        category=payload.category,
        experience_level=payload.experience_level,
        company=payload.company,
        role=payload.role,
        tags=payload.tags,
        source="Community" if created_by else "Admin",
        created_by=created_by,
    )

    saved_question = QuestionBankRepository.create_question(db, question)

    try:
        upsert_question(saved_question)
    except Exception as e:
        print(f"Qdrant sync failed: {e}")

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

    db.commit()
    db.refresh(question)

    upsert_question(question)

    return question


def delete_question(
    db: Session,
    question: InterviewQuestionBank,
):
    question_id = question.id
    QuestionBankRepository.delete_question(db, question)
    delete_question_vector(question_id)


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


def get_filters_meta(db: Session, user_id: int | None = None):
    from sqlalchemy import func
    
    # Group by skill
    skills_raw = db.query(
        InterviewQuestionBank.skill,
        func.count(InterviewQuestionBank.id)
    ).group_by(InterviewQuestionBank.skill).all()
    skills = [{"name": s, "count": c} for s, c in skills_raw if s]

    # Group by category
    categories_raw = db.query(
        InterviewQuestionBank.category,
        func.count(InterviewQuestionBank.id)
    ).group_by(InterviewQuestionBank.category).all()
    categories = [{"name": cat, "count": c} for cat, c in categories_raw if cat]

    # Group by experience_level
    exp_raw = db.query(
        InterviewQuestionBank.experience_level,
        func.count(InterviewQuestionBank.id)
    ).group_by(InterviewQuestionBank.experience_level).all()
    experience_levels = [{"name": exp, "count": c} for exp, c in exp_raw if exp]

    # Group by company
    companies_raw = db.query(
        InterviewQuestionBank.company,
        func.count(InterviewQuestionBank.id)
    ).group_by(InterviewQuestionBank.company).all()
    companies = [{"name": comp, "count": c} for comp, c in companies_raw if comp]

    # Bookmarks count
    bookmarks_count = 0
    if user_id:
        from app.models.bookmark import InterviewBookmark
        bookmarks_count = db.query(func.count(InterviewBookmark.id)).filter(
            InterviewBookmark.user_id == user_id
        ).scalar() or 0

    # Difficulty counts
    easy_count = 0
    medium_count = 0
    hard_count = 0
    for exp, c in exp_raw:
        if not exp:
            medium_count += c
            continue
        str_exp = str(exp).lower()
        if any(x in str_exp for x in ["fresher", "junior", "easy", "0-"]):
            easy_count += c
        elif any(x in str_exp for x in ["3-5", "senior", "hard", "5+"]):
            hard_count += c
        else:
            medium_count += c

    return {
        "skills": skills,
        "categories": categories,
        "experience_levels": experience_levels,
        "companies": companies,
        "difficulties": {
            "Easy": easy_count,
            "Medium": medium_count,
            "Hard": hard_count
        },
        "bookmarks_count": bookmarks_count
    }
