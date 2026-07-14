from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.interview.repository.interview_repository import InterviewRepository
from app.interview.services.generator_service import InterviewGeneratorService
from app.interview.services.session_service import InterviewSessionService
from app.interview.services.interview_service import generate_sample_answer
from app.services.candidate_context_service import infer_candidate_level
from app.interview.schemas.question import InterviewPipelineConfig


class InterviewWorkflowService:
    @staticmethod
    def generate_interview(
        db: Session,
        current_user: User,
        resume_id: int,
        job_description: str,
        company: str | None,
        role: str | None,
    ) -> dict:
        resume = InterviewRepository.get_resume(db, resume_id, current_user.id)
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )
        candidate_context = infer_candidate_level(
            resume_text=resume.parsed_text or "",
        )
        candidate_type = candidate_context["candidate_level"].upper()
        difficulty_distribution = {
            difficulty: percentage / 100
            for difficulty, percentage in candidate_context[
                "difficulty_distribution"
            ].items()
        }
        pipeline_config = InterviewPipelineConfig(
            difficulty_distribution=difficulty_distribution,
        )
        generator_service = InterviewGeneratorService()
        questions_to_add = generator_service.generate_session_questions(
            resume_text=resume.parsed_text or "",
            job_description=job_description,
            config=pipeline_config,
            db=db,
        )
        session = InterviewSessionService.create_session(
            db=db,
            user_id=current_user.id,
            resume_id=resume.id,
            company=company,
            role=role,
            candidate_type=candidate_type,
            job_description=job_description,
        )

        for q_data in questions_to_add:
            InterviewSessionService.add_question_to_session(
                db=db, session_id=session.id, question_data=q_data
            )

        db.commit()
        db.refresh(session)
        return {"session": session}

    @staticmethod
    def get_history(db: Session, current_user: User) -> list:
        return InterviewRepository.get_user_interview_history(db, current_user.id)

    @staticmethod
    def get_session(db: Session, session_id: int, current_user: User):
        session = InterviewRepository.get_interview_session(
            db, session_id, current_user.id
        )
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found",
            )
        return session

    @staticmethod
    def toggle_bookmark(db: Session, question_id: int, current_user: User) -> dict:
        question = InterviewRepository.get_interview_question(
            db, question_id, current_user.id
        )
        if not question:
            raise HTTPException(
                status_code=404,
                detail="Interview question not found",
            )

        question.bookmarked = not question.bookmarked
        db.commit()
        db.refresh(question)
        return {
            "message": "Bookmark updated successfully",
            "bookmarked": question.bookmarked,
        }

    @staticmethod
    def delete_session(db: Session, session_id: int, current_user: User) -> dict:
        session = InterviewRepository.get_session_by_id(db, session_id, current_user.id)
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found",
            )

        InterviewRepository.delete_session(db, session)
        return {
            "message": "Interview session deleted successfully",
        }

    @staticmethod
    def get_question_details(db: Session, question_id: int, current_user: User) -> dict:
        question = InterviewRepository.get_question_by_id(db, question_id)
        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found",
            )

        session = InterviewRepository.get_session_by_id(
            db, question.session_id, current_user.id
        )
        if not session:
            raise HTTPException(
                status_code=403,
                detail="Access denied",
            )

        def has_valid_answer(ans):
            if not ans:
                return False
            if isinstance(ans, dict):
                return bool(ans.get("sample_answer") or ans.get("answer"))
            if isinstance(ans, str):
                return bool(ans.strip())
            return False

        if question.details_generated or has_valid_answer(question.answer):
            if not question.details_generated:
                question.details_generated = True
                db.commit()
            return {
                "answer": question.answer,
            }

        resume = InterviewRepository.get_resume(db, session.resume_id, current_user.id)
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        result = generate_sample_answer(
            resume.parsed_text,
            session.job_description,
            question.question,
        )

        question.answer = result["answer"]
        question.details_generated = True

        db.commit()
        db.refresh(question)
        return {
            "answer": question.answer,
        }
