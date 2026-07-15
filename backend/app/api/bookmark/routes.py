from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.schemas.bookmark import BookmarkRequest
from app.schemas.interview_bank import InterviewQuestionResponse

from app.services.bookmark_service import (
    toggle_bookmark,
    get_user_bookmarks,
)

router = APIRouter(
    prefix="/api/bookmarks",
    tags=["Bookmarks"],
)


@router.post("/")
def bookmark_question(
    payload: BookmarkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return toggle_bookmark(
            db=db,
            user_id=current_user.id,
            question_id=payload.question_id,
        )

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to update bookmark. "
                "Please try again."
            ),
        )


@router.get(
    "/",
    response_model=list[InterviewQuestionResponse],
)
def bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_user_bookmarks(
            db=db,
            user_id=current_user.id,
        )

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch bookmarks. "
                "Please try again."
            ),
        )
