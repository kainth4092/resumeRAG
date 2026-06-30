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
    search: str | None = None,
):
    return QuestionBankRepository.list_questions(
        db,
        skill=skill,
        category=category,
        experience_level=experience_level,
        search=search,
    )
