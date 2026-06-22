from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.resume import Resume
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
)
from app.models.user import User
from app.schemas.interview import (
    GenerateInterviewRequest,
    GenerateInterviewResponse,
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    InterviewSessionResponse,
    InterviewHistoryItem,
)
from app.services.interview_service import (
    generate_interview_questions,
    evaluate_interview_answer,
)
import json


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview Prep"],
)

CATEGORY_NAMES = {
    "technical": "Technical",
    "behavioral": "Behavioral",
    "hr": "HR",
    "coding": "Coding",
    "project": "Project",
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
                        tip=item.get("tip"),
                        answer=item.get("answer"),
                        key_points=item.get("key_points", []),
                        common_mistakes=item.get("common_mistakes", []),
                        follow_up_questions=item.get("follow_up_questions", []),
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


@router.post(
    "/evaluate",
    response_model=EvaluateAnswerResponse,
)
def evaluate_answer(
    payload: EvaluateAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = (
            db.query(InterviewQuestion)
            .join(InterviewSession)
            .filter(
                InterviewQuestion.id == payload.question_id,
                InterviewSession.user_id == current_user.id,
            )
            .first()
        )
        if not question:
            raise HTTPException(
                status_code=404,
                detail="Interview question not found",
            )
        result = evaluate_interview_answer(
            question.question,
            question.answer,
            payload.user_answer,
        )

        evaluation = result.get("evaluation", result) if isinstance(result, dict) else {}
        if not isinstance(evaluation, dict):
            evaluation = {}

        strengths = evaluation.get("strengths", []) or []
        weaknesses = evaluation.get("weaknesses", []) or []
        missing_points = evaluation.get("missing_points", evaluation.get("missingPoints", [])) or []
        improved_answer = evaluation.get("improved_answer", evaluation.get("improvedAnswer", "")) or ""
        feedback = evaluation.get("feedback", "") or ""

        db_answer = InterviewAnswer(
            question_id=question.id,
            user_answer=payload.user_answer,
            overall_score=evaluation.get("overall", evaluation.get("overall_score", 0)),
            technical_score=evaluation.get("technical", evaluation.get("technical_score", 0)),
            communication_score=evaluation.get("communication", evaluation.get("communication_score", 0)),
            confidence_score=evaluation.get("confidence", evaluation.get("confidence_score", 0)),
            feedback=json.dumps(
                {
                    "feedback": feedback,
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "missing_points": missing_points,
                }
            ),
            improved_answer=improved_answer,
        )

        db.add(db_answer)
        db.commit()
        db.refresh(db_answer)

        return EvaluateAnswerResponse(
            overall_score=evaluation.get("overall", evaluation.get("overall_score", 0)),
            technical_score=evaluation.get("technical", evaluation.get("technical_score", 0)),
            communication_score=evaluation.get("communication", evaluation.get("communication_score", 0)),
            confidence_score=evaluation.get("confidence", evaluation.get("confidence_score", 0)),
            feedback=feedback,
            improved_answer=improved_answer,
            strengths=strengths,
            weaknesses=weaknesses,
            missing_points=missing_points,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate interview answer: {str(e)}",
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
            .options(
                joinedload(InterviewSession.questions).joinedload(
                    InterviewQuestion.answers
                )
            )
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
