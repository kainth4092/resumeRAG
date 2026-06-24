from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.schemas.interview_bank import (
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
)
from app.services.qdrant_service import upsert_question
from app.services.qdrant_service import delete_question_vector


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

    db.add(question)
    db.commit()
    db.refresh(question)

    try:
        upsert_question(question)
    except Exception as e:
        print(f"Qdrant sync failed: {e}")

    return question


def get_question(
    db: Session,
    question_id: int,
):
    return (
        db.query(InterviewQuestionBank)
        .filter(
            InterviewQuestionBank.id == question_id,
        )
        .first()
    )


def get_question_by_id(
    db: Session,
    question_id: int,
):
    return (
        db.query(InterviewQuestionBank)
        .filter(
            InterviewQuestionBank.id == question_id,
        )
        .first()
    )


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
    db.delete(question)
    db.commit()
    delete_question_vector(question_id)


def list_questions(
    db: Session,
    skill: str | None = None,
    category: str | None = None,
    experience_level: str | None = None,
    search: str | None = None,
):
    query = db.query(InterviewQuestionBank)

    if skill:
        query = query.filter(InterviewQuestionBank.skill.ilike(skill))
    if category:
        query = query.filter(InterviewQuestionBank.category.ilike(category))
    if experience_level:
        query = query.filter(
            InterviewQuestionBank.experience_level.ilike(experience_level)
        )
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            InterviewQuestionBank.question.ilike(search_pattern)
            | InterviewQuestionBank.answer.ilike(search_pattern)
        )

    return query.order_by(
        InterviewQuestionBank.skill.asc(),
        InterviewQuestionBank.question.asc(),
    ).all()
