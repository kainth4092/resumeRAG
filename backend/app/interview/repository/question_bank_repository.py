from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank


class QuestionBankRepository:
    @staticmethod
    def get_question(db: Session, question_id: int) -> InterviewQuestionBank | None:
        return (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.id == question_id)
            .first()
        )

    @staticmethod
    def create_question(
        db: Session, question: InterviewQuestionBank
    ) -> InterviewQuestionBank:
        db.add(question)
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question: InterviewQuestionBank) -> None:
        db.delete(question)
        db.commit()

    @staticmethod
    def list_questions(
        db: Session,
        skill: str | None = None,
        category: str | None = None,
        experience_level: str | None = None,
        search: str | None = None,
    ) -> list[InterviewQuestionBank]:
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
