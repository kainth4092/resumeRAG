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
        difficulty: str | None = None,
        company: str | None = None,
        source: str | None = None,
        search: str | None = None,
        bookmark_only: bool = False,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[InterviewQuestionBank], int]:
        from app.models.bookmark import InterviewBookmark
        query = db.query(InterviewQuestionBank)

        if bookmark_only and user_id:
            query = query.join(
                InterviewBookmark,
                InterviewBookmark.question_id == InterviewQuestionBank.id
            ).filter(
                InterviewBookmark.user_id == user_id
            )

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
            query = query.filter(
                InterviewQuestionBank.company.ilike(company)
            )
        if difficulty:
            difficulty_lower = difficulty.lower()
            if difficulty_lower == "easy":
                query = query.filter(
                    InterviewQuestionBank.experience_level.ilike("%fresher%")
                    | InterviewQuestionBank.experience_level.ilike("%junior%")
                    | InterviewQuestionBank.experience_level.ilike("%easy%")
                    | InterviewQuestionBank.experience_level.ilike("%0-%")
                )
            elif difficulty_lower == "hard":
                query = query.filter(
                    InterviewQuestionBank.experience_level.ilike("%3-5%")
                    | InterviewQuestionBank.experience_level.ilike("%senior%")
                    | InterviewQuestionBank.experience_level.ilike("%hard%")
                    | InterviewQuestionBank.experience_level.ilike("%5+%")
                )
            elif difficulty_lower == "medium":
                query = query.filter(
                    ~InterviewQuestionBank.experience_level.ilike("%fresher%")
                    & ~InterviewQuestionBank.experience_level.ilike("%junior%")
                    & ~InterviewQuestionBank.experience_level.ilike("%easy%")
                    & ~InterviewQuestionBank.experience_level.ilike("%0-%")
                    & ~InterviewQuestionBank.experience_level.ilike("%3-5%")
                    & ~InterviewQuestionBank.experience_level.ilike("%senior%")
                    & ~InterviewQuestionBank.experience_level.ilike("%hard%")
                    & ~InterviewQuestionBank.experience_level.ilike("%5+%")
                )
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                InterviewQuestionBank.question.ilike(search_pattern)
                | InterviewQuestionBank.answer.ilike(search_pattern)
            )

        total = query.count()

        items = query.order_by(
            InterviewQuestionBank.skill.asc(),
            InterviewQuestionBank.question.asc(),
        ).offset(skip).limit(limit).all()

        return items, total
