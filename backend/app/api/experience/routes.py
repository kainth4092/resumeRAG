from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_experience import UserExperience
from app.schemas.experience import ExperienceCreate, ExperienceResponse

router = APIRouter(prefix="/api/experience", tags=["Experience"])


@router.post("/", response_model=ExperienceResponse)
def add_experience(
    payload: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_experience = (
        db.query(UserExperience)
        .filter(
            UserExperience.user_id == current_user.id,
            UserExperience.company == payload.company,
            UserExperience.role == payload.role,
        )
        .first()
    )

    if existing_experience:
        raise HTTPException(status_code=409, detail="Experience already exists.")
    experience = UserExperience(user_id=current_user.id, **payload.model_dump())
    try:
        db.add(experience)
        db.commit()
        db.refresh(experience)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return experience


@router.get("/", response_model=list[ExperienceResponse])
def get_experiences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiences = (
        db.query(UserExperience).filter(UserExperience.user_id == current_user.id).all()
    )
    return experiences


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: int,
    payload: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experience = (
        db.query(UserExperience)
        .filter(
            UserExperience.id == experience_id,
            UserExperience.user_id == current_user.id,
        )
        .first()
    )
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(experience, key, value)
    try:
        db.commit()
        db.refresh(experience)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return experience


@router.delete("/{experience_id}")
def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experience = (
        db.query(UserExperience)
        .filter(
            UserExperience.id == experience_id,
            UserExperience.user_id == current_user.id,
        )
        .first()
    )
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    try:
        db.delete(experience)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")

    return {"message": "Experience deleted"}
