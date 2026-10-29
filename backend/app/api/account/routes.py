import json
import os
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.resume import Resume
from app.models.user_skill import UserSkill
from app.models.user_project import UserProject
from app.models.user_education import UserEducation
from app.models.user_experience import UserExperience
from app.models.roadmap import Roadmap
from app.models.pipeline_run import PipelineRun
from app.models.interview import InterviewSession
from app.models.user_jobs import UserJob
from app.models.user_settings import UserSettings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/account", tags=["Account & Data Rights"])


@router.get("/export")
def export_user_account_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Data Rights (GDPR/CCPA): Export all user-associated data as structured JSON.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    projects = db.query(UserProject).filter(UserProject.user_id == current_user.id).all()
    education = db.query(UserEducation).filter(UserEducation.user_id == current_user.id).all()
    experiences = db.query(UserExperience).filter(UserExperience.user_id == current_user.id).all()
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).all()
    pipeline_runs = db.query(PipelineRun).filter(PipelineRun.user_id == current_user.id).all()
    interview_sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).all()
    tracked_jobs = db.query(UserJob).filter(UserJob.user_id == current_user.id).all()
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()

    parsed_resumes = []
    for r in resumes:
        r_json = None
        if r.resume_json:
            try:
                r_json = json.loads(r.resume_json) if isinstance(r.resume_json, str) else r.resume_json
            except Exception:
                r_json = r.resume_json

        parsed_resumes.append(
            {
                "id": r.id,
                "title": r.title,
                "original_filename": r.original_filename,
                "source": r.source,
                "ats_score": r.ats_score,
                "skills": r.skills,
                "template": r.template,
                "resume_json": r_json,
                "parsed_text": r.parsed_text,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
        )

    export_payload = {
        "export_metadata": {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "export_version": "1.0",
            "system": "ResuPilot AI",
        },
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "provider": current_user.provider,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "profile": {
            "full_name": profile.full_name if profile else None,
            "headline": profile.headline if profile else None,
            "phone": profile.phone if profile else None,
            "location": profile.location if profile else None,
            "bio": profile.bio if profile else None,
        } if profile else None,
        "resumes": parsed_resumes,
        "skills": [s.skill_name for s in skills],
        "projects": [
            {
                "title": p.title,
                "description": p.description,
                "tech_stack": p.tech_stack,
                "github_url": p.github_url,
                "live_url": p.live_url,
            }
            for p in projects
        ],
        "education": [
            {
                "institution": e.institution,
                "degree": e.degree,
                "start_year": e.start_year,
                "end_year": e.end_year,
            }
            for e in education
        ],
        "experiences": [
            {
                "company": ex.company,
                "role": ex.role,
                "description": ex.description,
                "start_month": ex.start_month,
                "start_year": ex.start_year,
                "end_month": ex.end_month,
                "end_year": ex.end_year,
                "currently_working": ex.currently_working,
            }
            for ex in experiences
        ],
        "roadmaps": [
            {
                "id": rd.id,
                "target_role": rd.target_role,
                "target_level": rd.target_level,
                "plan": rd.plan,
                "completed_tasks": rd.completed_tasks,
            }
            for rd in roadmaps
        ],
        "pipeline_runs": [
            {
                "id": pr.id,
                "status": pr.status,
                "template": pr.template,
                "steps": pr.steps,
                "created_at": pr.created_at.isoformat() if pr.created_at else None,
            }
            for pr in pipeline_runs
        ],
        "interview_sessions": [
            {
                "id": s.id,
                "role": s.role,
                "company": s.company,
                "candidate_type": s.candidate_type,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "questions": [
                    {
                        "id": q.id,
                        "category": q.category,
                        "question": q.question,
                        "difficulty": q.difficulty,
                        "answer": q.answer,
                    }
                    for q in s.questions
                ],
            }
            for s in interview_sessions
        ],
        "tracked_jobs": [
            {
                "company_name": j.company_name,
                "job_title": j.job_title,
                "status": j.status,
                "location": j.location,
                "applied_date": j.applied_date,
            }
            for j in tracked_jobs
        ],
        "settings": {
            "email_notifications": user_settings.email_notifications if user_settings else True,
            "interview_alerts": user_settings.interview_alerts if user_settings else True,
            "roadmap_updates": user_settings.roadmap_updates if user_settings else True,
            "product_updates": user_settings.product_updates if user_settings else False,
        } if user_settings else None,
    }

    return export_payload


@router.delete("", status_code=status.HTTP_200_OK)
def delete_user_account_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Data Rights (GDPR/CCPA): Delete account, removing:
    - User uploaded resume files from disk
    - Derived vectors and payloads from Qdrant
    - Database row and cascading all derived records
    """
    user_id = current_user.id

    # 1. Clean up uploaded files from disk
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    for r in resumes:
        if r.file_path and os.path.exists(r.file_path):
            try:
                os.remove(r.file_path)
            except OSError as err:
                logger.warning("Could not delete resume file %s: %s", r.file_path, err)

    # 2. Clean up Qdrant vector points
    try:
        from app.services.qdrant_service import get_client, COLLECTION_NAME
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue

        qclient = get_client()
        qclient.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))]
            ),
        )
    except Exception as q_err:
        logger.warning("Qdrant points deletion for user_id=%s skipped: %s", user_id, q_err)

    # 3. Delete database record (cascading all child tables)
    try:
        db.delete(current_user)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete account.") from exc

    return {"message": "Account, files, and personal data deleted successfully."}
