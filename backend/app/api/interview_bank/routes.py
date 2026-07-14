import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.resume.repository.resume_repository import ResumeRepository
from app.schemas.interview_bank import (
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
    InterviewQuestionResponse,
    InterviewQuestionListResponse,
)
from app.schemas.interview_retrieval import InterviewRetrievalRequest
from app.interview.services.interview_bank_service import (
    create_question,
    get_question,
    get_question_by_id,
    update_question,
    delete_question,
    list_questions,
)
from app.interview.services.interview_retrieval_service import (
    extract_resume_skills,
    extract_jd_skills,
    retrieve_questions_rag,
)
from app.services.notification_service import create_notification


router = APIRouter(
    prefix="/api/interview-bank",
    tags=["Interview Question Bank"],
)
logger = logging.getLogger(__name__)


@router.post("/", response_model=InterviewQuestionResponse)
def create_bank_question(
    payload: InterviewQuestionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = create_question(
            db=db,
            payload=payload,
            created_by=current_user.id,
            background_tasks=background_tasks,
        )

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Question shared successfully",
            message=(
                f'Your interview question about '
                f'"{payload.skill or "General"}" has been shared with the community.'
            ),
            notification_type="interview",
            action_url="/interview-prep?tab=community",
        )

        return question

    except HTTPException:
        raise

    except Exception:
        logger.exception("Failed to create interview bank question")
        raise HTTPException(
            status_code=500,
            detail="Failed to create question.",
        )


@router.get("/meta")
def get_bank_meta(
    skill: str | None = None,
    category: str | None = None,
    experience: str | None = None,
    difficulty: str | None = None,
    company: str | None = None,
    source: str | None = None,
    search: str | None = None,
    bookmark_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.interview.services.interview_bank_service import get_filters_meta

    try:
        return get_filters_meta(
            db,
            user_id=current_user.id,
            skill=skill,
            category=category,
            experience_level=experience,
            difficulty=difficulty,
            company=company,
            source=source,
            search=search,
            bookmark_only=bookmark_only,
        )
    except Exception:
        logger.exception("Failed to fetch interview bank metadata")
        raise HTTPException(status_code=500, detail="Failed to fetch metadata.")


@router.post("/generate-answer")
def generate_bank_answer(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    question = payload.get("question")
    skill = payload.get("skill", "")
    category = payload.get("category", "")
    experience_level = payload.get("experience_level", "")

    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question is required.")

    from app.services.llm_service import generate_general_answer

    try:
        answer = generate_general_answer(
            question=question,
            skill=skill,
            category=category,
            experience_level=experience_level,
        )
        return {"answer": answer}
    except Exception:
        logger.exception("Failed to generate bank answer")
        raise HTTPException(status_code=500, detail="Failed to generate answer.")


@router.get("/", response_model=InterviewQuestionListResponse)
def list_bank_questions(
    skill: str | None = None,
    category: str | None = None,
    experience: str | None = None,
    difficulty: str | None = None,
    company: str | None = None,
    source: str | None = None,
    search: str | None = None,
    bookmark_only: bool = False,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        skip = (page - 1) * limit
        items, total = list_questions(
            db=db,
            skill=skill,
            category=category,
            experience_level=experience,
            difficulty=difficulty,
            company=company,
            source=source,
            search=search,
            bookmark_only=bookmark_only,
            user_id=current_user.id,
            skip=skip,
            limit=limit,
        )
        return {"total": total, "questions": items}

    except Exception:
        logger.exception("Failed to fetch interview bank questions")
        raise HTTPException(status_code=500, detail="Failed to fetch questions.")


@router.get("/{question_id}", response_model=InterviewQuestionResponse)
def get_bank_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = get_question(db, question_id)

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

        return question

    except HTTPException:
        raise

    except Exception:
        logger.exception("Failed to fetch interview bank question")
        raise HTTPException(status_code=500, detail="Failed to fetch question.")


@router.patch("/{question_id}", response_model=InterviewQuestionResponse)
def update_bank_question(
    question_id: int,
    payload: InterviewQuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = get_question_by_id(db, question_id)

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

        if question.created_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this question.",
            )

        return update_question(
            db=db,
            question=question,
            payload=payload,
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("Failed to update interview bank question")
        raise HTTPException(status_code=500, detail="Failed to update question.")


@router.delete("/{question_id}")
def delete_bank_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        question = get_question_by_id(db, question_id)

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

        if question.created_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this question.",
            )

        delete_question(
            db=db,
            question=question,
        )

        return {"message": "Question deleted successfully."}

    except HTTPException:
        raise

    except Exception:
        logger.exception("Failed to delete interview bank question")
        raise HTTPException(status_code=500, detail="Failed to delete question.")


@router.post(
    "/retrieve",
    response_model=list[InterviewQuestionResponse],
)
def retrieve_interview_questions(
    payload: InterviewRetrievalRequest,
    limit: int = 40,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resume = ResumeRepository.get_resume_by_id(
            db, payload.resume_id, current_user.id
        )
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found.",
            )
        resume_skills = extract_resume_skills(
            resume.parsed_text,
        )
        jd_skills = extract_jd_skills(
            payload.job_description,
        )
        questions = retrieve_questions_rag(
            db,
            resume_skills=resume_skills,
            jd_skills=jd_skills,
            limit=limit,
        )
        return questions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve interview questions: {str(e)}",
        )
