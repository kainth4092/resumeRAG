from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_education import UserEducation
from app.models.user_experience import UserExperience


router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.post("", response_model=ProfileResponse)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_profile = (
        db.query(Profile).filter(Profile.user_id == current_user.id).first()
    )
    if existing_profile:
        raise HTTPException(status_code=409, detail="Profile already exists")
    profile = Profile(user_id=current_user.id, **payload.model_dump())
    try:
        db.add(profile)
        db.commit()
        db.refresh(profile)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return profile


@router.get("", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    try:
        db.commit()
        db.refresh(profile)

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    return profile


@router.get("/complete")
def get_complete_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    projects = (
        db.query(UserProject).filter(UserProject.user_id == current_user.id).all()
    )
    education = (
        db.query(UserEducation).filter(UserEducation.user_id == current_user.id).all()
    )
    experiences = (
        db.query(UserExperience).filter(UserExperience.user_id == current_user.id).all()
    )

    return {
        "profile": (
            {
                "id": profile.id if profile else None,
                "headline": profile.headline if profile else None,
                "summary": profile.summary if profile else None,
            }
            if profile
            else None
        ),
        "skills": [
            {"id": skill.id, "skill_name": skill.skill_name} for skill in skills
        ],
        "projects": [
            {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "tech_stack": project.tech_stack,
                "github_url": project.github_url,
                "live_url": project.live_url,
            }
            for project in projects
        ],
        "education": [
            {
                "id": edu.id,
                "institution": edu.institution,
                "degree": edu.degree,
                "start_year": edu.start_year,
                "end_year": edu.end_year,
            }
            for edu in education
        ],
        "experiences": [
            {
                "id": exp.id,
                "company": exp.company,
                "role": exp.role,
                "description": exp.description,
            }
            for exp in experiences
        ],
    }
