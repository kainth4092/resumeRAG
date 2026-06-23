from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.resume import Resume
from app.models.interview import InterviewSession, InterviewQuestion
from app.models.user import User
from app.schemas.interview import (
    GenerateInterviewRequest,
    GenerateInterviewResponse,
    InterviewSessionResponse,
    InterviewHistoryItem,
)
from app.services.interview_service import (
    generate_interview_questions,
    generate_question_details,
    generate_sample_answer,
)

import json


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview Prep"],
)

CATEGORY_NAMES = {
    "technical": "Technical",
    "project": "Project",
    "experience": "Experience",
}


@router.post(
    "/generate",
    response_model=GenerateInterviewResponse,
)
def generate_interview(
    payload: GenerateInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resume = (
            db.query(Resume)
            .filter(
                Resume.id == payload.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )
        ai = generate_interview_questions(
            resume.parsed_text,
            payload.job_description,
        )
        session = InterviewSession(
            user_id=current_user.id,
            resume_id=resume.id,
            company=payload.company,
            role=payload.role,
            candidate_type=ai.get("candidate_type", "FRESHER"),
            job_description=payload.job_description,
        )

        db.add(session)
        db.flush()

        for category, questions in ai.items():
            if not isinstance(questions, list):
                continue
            for item in questions:

                db.add(
                    InterviewQuestion(
                        session_id=session.id,
                        category=CATEGORY_NAMES.get(
                            str(category).lower(),
                            str(category).title(),
                        ),
                        question=item.get("question", ""),
                        difficulty=item.get("difficulty", "Medium"),
                        answer=None,
                        details_generated=False,
                        estimated_duration=item.get("estimated_duration"),
                        tech_skill=item.get("tech_skill"),
                        bookmarked=False,
                    )
                )
        db.commit()
        db.refresh(session)
        return {"session": session}

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate interview questions: {str(e)}",
        )


@router.get(
    "/history",
    response_model=list[InterviewHistoryItem],
)
def interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        history = (
            db.query(InterviewSession)
            .options(joinedload(InterviewSession.questions))
            .filter(
                InterviewSession.user_id == current_user.id,
            )
            .order_by(
                InterviewSession.created_at.desc(),
            )
            .all()
        )

        return history

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch interview history: {str(e)}",
        )


@router.get(
    "/{session_id}",
    response_model=InterviewSessionResponse,
)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == session_id,
                InterviewSession.user_id == current_user.id,
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found",
            )

        return session

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch interview session: {str(e)}",
        )


@router.patch("/bookmark/{question_id}")
def toggle_bookmark(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:

        question = (
            db.query(InterviewQuestion)
            .join(InterviewSession)
            .filter(
                InterviewQuestion.id == question_id,
                InterviewSession.user_id == current_user.id,
            )
            .first()
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

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update bookmark: {str(e)}",
        )


@router.delete("/{session_id}")
def delete_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:

        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == session_id,
                InterviewSession.user_id == current_user.id,
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found",
            )

        db.delete(session)
        db.commit()

        return {
            "message": "Interview session deleted successfully",
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete interview session: {str(e)}",
        )


@router.post("/question/{question_id}/details")
def get_question_details(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = (
            db.query(InterviewQuestion)
            .filter(InterviewQuestion.id == question_id)
            .first()
        )

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found",
            )

        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == question.session_id,
                InterviewSession.user_id == current_user.id,
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=403,
                detail="Access denied",
            )

        if question.details_generated:
            return {
                "answer": question.answer,
            }

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == session.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )

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

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate sample answer: {str(e)}",
        )
