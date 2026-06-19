from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_skill import UserSkill
from app.schemas.skill import SkillCreate, SkillResponse

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.post("/", response_model=SkillResponse)
def add_skill(
    payload: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_skill = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_name == payload.skill_name,
        )
        .first()
    )
    if existing_skill:
        raise HTTPException(status_code=409, detail="Skill already exists.")
    skill = UserSkill(user_id=current_user.id, skill_name=payload.skill_name)
    try:
        db.add(skill)
        db.commit()
        db.refresh(skill)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return skill


@router.get("/", response_model=list[SkillResponse])
def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    return skills


@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    skill = (
        db.query(UserSkill)
        .filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id)
        .first()
    )
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    try:
        db.delete(skill)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return {"message": "Skill deleted"}
