import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.interview import (
    GenerateInterviewRequest,
    GenerateInterviewResponse,
    InterviewSessionResponse,
    InterviewHistoryItem,
)
from app.interview.services.interview_workflow_service import InterviewWorkflowService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview Prep"],
)


@router.post(
    "/generate",
    response_model=GenerateInterviewResponse,
)
def generate_interview(
    payload: GenerateInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.generate_interview(
        db=db,
        current_user=current_user,
        resume_id=payload.resume_id,
        job_description=payload.job_description,
        company=payload.company,
        role=payload.role,
    )


@router.get(
    "/history",
    response_model=list[InterviewHistoryItem],
)
def interview_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.get_history(db, current_user)


@router.get(
    "/{session_id}",
    response_model=InterviewSessionResponse,
)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.get_session(db, session_id, current_user)


@router.patch("/bookmark/{question_id}")
def toggle_bookmark(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.toggle_bookmark(db, question_id, current_user)


@router.delete("/{session_id}")
def delete_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.delete_session(db, session_id, current_user)


@router.post("/question/{question_id}/details")
def get_question_details(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return InterviewWorkflowService.get_question_details(db, question_id, current_user)


@router.get("/challenge/questions")
def get_challenge_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.interview.services.challenge_service import ChallengeService

    return ChallengeService.get_challenge_questions(db)


@router.post("/challenge/submit")
def submit_challenge(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.interview.services.challenge_service import ChallengeService

    return ChallengeService.submit_challenge(payload)
