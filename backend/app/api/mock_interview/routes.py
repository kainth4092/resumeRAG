import logging
import os
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.services.speech_to_text_service import speech_to_text_service
from app.services.evaluation_service import evaluation_service
from app.services.mock_interview_service import mock_interview_service
from app.services.history_service import history_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/mock-interview",
    tags=["AI Mock Interview"],
)


class AnswerItem(BaseModel):
    question_text: str
    transcript: str


class BatchEvaluateRequest(BaseModel):
    answers: List[AnswerItem]


class SaveSessionRequest(BaseModel):
    interview_type: str
    duration: int
    overall_score: int
    questions_attempted: int
    performance_summary: str
    evaluation_report: Dict[str, Any]


@router.get("/questions")
def get_mock_questions(
    type: str = "Real Voice Interview",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        questions = mock_interview_service.get_interview_questions(
            db, interview_type=type, user_id=current_user.id
        )
        return {"questions": questions}
    except Exception as e:
        logger.exception("Error fetching mock questions")
        raise HTTPException(status_code=500, detail="Failed to fetch mock questions.")


@router.post("/transcribe")
def transcribe_audio(
    file: UploadFile = File(...),
    prompt: str = Form(None),
    language: str = Form("en"),
    current_user: User = Depends(get_current_user),
):
    # Save the file temporarily
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(file.file.read())
        temp_path = temp_file.name

    try:
        transcript = speech_to_text_service.transcribe(
            temp_path, prompt=prompt, language=language
        )
        return {"transcript": transcript}
    except Exception as e:
        logger.exception("Failed to transcribe audio")
        raise HTTPException(status_code=500, detail="Transcription failed.")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Failed to clean up temp file {temp_path}: {e}")


@router.post("/evaluate")
def evaluate_interview(
    payload: BatchEvaluateRequest, current_user: User = Depends(get_current_user)
):
    try:
        answers_data = [item.dict() for item in payload.answers]
        evaluation = evaluation_service.evaluate_interview(answers_data)
        return evaluation
    except Exception as e:
        logger.exception("Batch evaluation request failed")
        raise HTTPException(status_code=500, detail="Evaluation failed.")


@router.post("/session")
def save_session(
    payload: SaveSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        session = history_service.save_session(
            db=db,
            user_id=current_user.id,
            interview_type=payload.interview_type,
            duration=payload.duration,
            overall_score=payload.overall_score,
            questions_attempted=payload.questions_attempted,
            performance_summary=payload.performance_summary,
            evaluation_report=payload.evaluation_report,
        )
        return {
            "success": True,
            "session_id": session.id,
            "message": "Interview session saved successfully.",
        }
    except Exception as e:
        logger.exception("Failed to save mock interview session")
        raise HTTPException(status_code=500, detail="Failed to save interview session.")


@router.get("/history")
def get_interview_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        sessions = history_service.get_history(db, current_user.id)
        # Format the output history list
        history_list = []
        for s in sessions:
            history_list.append(
                {
                    "id": s.id,
                    "interview_type": s.interview_type,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                    "duration": s.duration,
                    "overall_score": s.overall_score,
                    "questions_attempted": s.questions_attempted,
                    "performance_summary": s.performance_summary,
                    "evaluation_report": s.evaluation_report,
                }
            )
        return {"history": history_list}
    except Exception as e:
        logger.exception("Failed to load interview history")
        raise HTTPException(status_code=500, detail="Failed to load interview history.")


@router.get("/session/{session_id}")
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = history_service.get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    return {
        "id": session.id,
        "interview_type": session.interview_type,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "duration": session.duration,
        "overall_score": session.overall_score,
        "questions_attempted": session.questions_attempted,
        "performance_summary": session.performance_summary,
        "evaluation_report": session.evaluation_report,
    }
