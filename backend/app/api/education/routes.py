from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_education import UserEducation
from app.schemas.education import EducationCreate, EducationResponse

router = APIRouter(prefix="/api/education", tags=["Education"])


@router.post("/", response_model=EducationResponse)
def add_education(
    payload: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_education = (
        db.query(UserEducation)
        .filter(
            UserEducation.user_id == current_user.id,
            UserEducation.institution == payload.institution,
            UserEducation.degree == payload.degree,
        )
        .first()
    )

    if existing_education:
        raise HTTPException(status_code=409, detail="Education already exists.")
    education = UserEducation(user_id=current_user.id, **payload.model_dump())
    try:
        db.add(education)
        db.commit()
        db.refresh(education)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return education


@router.get("/", response_model=list[EducationResponse])
def get_education(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    education = (
        db.query(UserEducation).filter(UserEducation.user_id == current_user.id).all()
    )
    return education


@router.put("/{education_id}", response_model=EducationResponse)
def update_education(
    education_id: int,
    payload: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    education = (
        db.query(UserEducation)
        .filter(
            UserEducation.id == education_id, UserEducation.user_id == current_user.id
        )
        .first()
    )
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(education, key, value)
    try:
        db.commit()
        db.refresh(education)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return education


@router.delete("/{education_id}")
def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    education = (
        db.query(UserEducation)
        .filter(
            UserEducation.id == education_id, UserEducation.user_id == current_user.id
        )
        .first()
    )
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    try:
        db.delete(education)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")

    return {"message": "Education deleted"}
