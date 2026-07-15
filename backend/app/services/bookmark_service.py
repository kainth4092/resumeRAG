from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.bookmark import InterviewBookmark
from app.models.interview_bank import InterviewQuestionBank


def toggle_bookmark(
    db: Session,
    user_id: int,
    question_id: int,
):
    question = (
        db.query(
            InterviewQuestionBank
        )
        .filter(
            InterviewQuestionBank.id
            == question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail=(
                "Interview question "
                "not found."
            ),
        )

    bookmark = (
        db.query(InterviewBookmark)
        .filter(
            InterviewBookmark.user_id == user_id,
            InterviewBookmark.question_id == question_id,
        )
        .first()
    )

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {"bookmarked": False, "message": "Bookmark removed."}

    bookmark = InterviewBookmark(
        user_id=user_id,
        question_id=question_id,
    )

    db.add(bookmark)
    db.commit()

    return {"bookmarked": True, "message": "Bookmarked successfully."}


def get_user_bookmarks(
    db: Session,
    user_id: int,
):
    return (
        db.query(InterviewQuestionBank)
        .join(
            InterviewBookmark,
            InterviewBookmark.question_id == InterviewQuestionBank.id,
        )
        .filter(
            InterviewBookmark.user_id == user_id,
        )
        .all()
    )
