import json
import logging
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.quota import check_pipeline_rate_limit, check_and_increment_daily_quota
from app.models.user import User
from app.models.resume import Resume
from app.models.pipeline_run import PipelineRun
from app.models.job_context import JobContext
from app.models.resume_job_match import ResumeJobMatch
from app.models.interview import InterviewSession
from app.models.roadmap import Roadmap
from app.schemas.pipeline import (
    PipelineRunRequest,
    PipelineRunResponse,
    PipelineRunDetail,
)
from app.pipeline.services.context_extractor import clean_and_hash_description
from app.pipeline.services.pipeline_runner import execute_pipeline_run

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])


@router.post(
    "/runs",
    response_model=PipelineRunResponse,
    status_code=202,
)
async def create_pipeline_run(
    payload: PipelineRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/pipeline/runs
    Idempotent pipeline trigger:
    Same (user_id, source_resume_id, description_hash, template) returns the existing run.
    """
    # 1. Rate limiting
    check_pipeline_rate_limit(current_user.id)

    # 2. Daily LLM quota
    check_and_increment_daily_quota(db, current_user.id, feature="pipeline")

    # 3. Validate source resume ownership if provided
    source_resume_id: int | None = None
    if payload.source.type == "resume":
        if not payload.source.resume_id:
            # Look up user's active resume or latest resume
            active = (
                db.query(Resume)
                .filter(Resume.user_id == current_user.id, Resume.is_active.is_(True))
                .first()
            )
            if not active:
                active = (
                    db.query(Resume)
                    .filter(Resume.user_id == current_user.id)
                    .order_by(Resume.created_at.desc())
                    .first()
                )
            if not active:
                raise HTTPException(
                    status_code=400,
                    detail="No source resume found. Please upload a resume or select profile as source.",
                )
            source_resume_id = active.id
        else:
            source_resume = (
                db.query(Resume)
                .filter(
                    Resume.id == payload.source.resume_id,
                    Resume.user_id == current_user.id,
                )
                .first()
            )
            if not source_resume:
                raise HTTPException(
                    status_code=404,
                    detail="Source resume not found or not owned by user.",
                )
            source_resume_id = source_resume.id

    # 4. Hash normalized JD
    cleaned_jd, desc_hash = clean_and_hash_description(payload.job_description)

    # 5. Idempotency Check: return existing run if inputs match exactly
    existing_run = (
        db.query(PipelineRun)
        .filter(
            PipelineRun.user_id == current_user.id,
            PipelineRun.source_resume_id == source_resume_id,
            PipelineRun.description_hash == desc_hash,
            PipelineRun.template == payload.template,
        )
        .first()
    )

    if existing_run and existing_run.status in ["completed", "partial", "running", "queued"]:
        logger.info(
            "Idempotent pipeline match for user=%s run_id=%s status=%s",
            current_user.id,
            existing_run.id,
            existing_run.status,
        )
        return PipelineRunResponse(
            run_id=existing_run.id,
            status=existing_run.status,
            is_existing=True,
            message="Found existing pipeline run with identical inputs.",
        )

    # 6. Create new PipelineRun
    run_id = str(uuid.uuid4())
    step_names = [
        "extract_job_context",
        "generate_resume",
        "jobs",
        "interview",
        "roadmap",
    ]
    initial_steps = [
        {"name": name, "status": "pending", "started_at": None, "finished_at": None, "error": None}
        for name in step_names
    ]

    new_run = PipelineRun(
        id=run_id,
        user_id=current_user.id,
        source_resume_id=source_resume_id,
        description_hash=desc_hash,
        template=payload.template,
        status="queued",
        steps=initial_steps,
    )
    db.add(new_run)
    db.commit()

    # 7. Queue background execution
    background_tasks.add_task(
        execute_pipeline_run,
        run_id=run_id,
        job_description=cleaned_jd,
        company=payload.company,
        role=payload.role,
    )

    return PipelineRunResponse(
        run_id=run_id,
        status="queued",
        is_existing=False,
        message="Pipeline run queued successfully.",
    )


@router.get(
    "/runs/{run_id}",
    response_model=PipelineRunDetail,
)
def get_pipeline_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/pipeline/runs/{id}
    Inspect status, step progress, and produced artifacts with IDOR security.
    """
    run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found.")

    if run.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this pipeline run.",
        )

    artifacts: dict[str, Any] = {}

    # Hydrate artifacts if resume or context was produced
    if run.generated_resume_id:
        gen_resume = (
            db.query(Resume)
            .filter(Resume.id == run.generated_resume_id)
            .first()
        )
        if gen_resume:
            resume_data = {}
            if gen_resume.resume_json:
                try:
                    resume_data = json.loads(gen_resume.resume_json)
                except Exception:
                    resume_data = {}
            analysis_data = {}
            if gen_resume.analysis_results:
                try:
                    analysis_data = json.loads(gen_resume.analysis_results)
                except Exception:
                    analysis_data = {}

            artifacts["resume"] = {
                "id": gen_resume.id,
                "title": gen_resume.title,
                "template": gen_resume.template,
                "ats_score": gen_resume.ats_score,
                "resume_json": resume_data,
                "analysis": analysis_data,
                "created_at": gen_resume.created_at.isoformat() if gen_resume.created_at else None,
            }

    if run.job_context_id:
        jc = db.query(JobContext).filter(JobContext.id == run.job_context_id).first()
        if jc:
            artifacts["job_context"] = {
                "id": jc.id,
                "title": jc.title,
                "company": jc.company,
                "seniority": jc.seniority,
                "location": jc.location,
                "required_skills": jc.required_skills or [],
                "preferred_skills": jc.preferred_skills or [],
                "keywords": jc.keywords or [],
                "responsibilities": jc.responsibilities or [],
            }

    # Hydrate jobs
    if run.generated_resume_id:
        matches = (
            db.query(ResumeJobMatch)
            .filter(ResumeJobMatch.resume_id == run.generated_resume_id)
            .order_by(ResumeJobMatch.score.desc())
            .all()
        )
        artifacts["jobs"] = [
            {
                "id": m.id,
                "job_id": m.job_id,
                "score": m.score,
                "matched_skills": m.matched_skills,
                "missing_skills": m.missing_skills,
                "why": m.reasons[0] if m.reasons else "",
                "job_data": m.job_data,
            }
            for m in matches
        ]

    # Hydrate interview session
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.pipeline_run_id == run.id)
        .first()
    )
    if not session and run.generated_resume_id:
        session = (
            db.query(InterviewSession)
            .filter(InterviewSession.resume_id == run.generated_resume_id)
            .first()
        )
    if session:
        artifacts["interview"] = {
            "session_id": session.id,
            "company": session.company,
            "role": session.role,
            "questions_count": session.questions_count,
            "questions": [
                {
                    "id": q.id,
                    "category": q.category,
                    "question": q.question,
                    "difficulty": q.difficulty,
                    "tech_skill": q.tech_skill,
                    "details_generated": q.details_generated,
                    "answer": q.answer,
                    "bookmarked": q.bookmarked,
                }
                for q in session.questions
            ],
        }

    # Hydrate roadmap
    if run.generated_resume_id:
        rm = (
            db.query(Roadmap)
            .filter(Roadmap.resume_id == run.generated_resume_id)
            .first()
        )
        if rm:
            artifacts["roadmap"] = {
                "id": rm.id,
                "target_role": rm.target_role,
                "target_level": rm.target_level,
                "plan": rm.plan,
                "completed_tasks": rm.completed_tasks,
            }

    return PipelineRunDetail(
        id=run.id,
        user_id=run.user_id,
        source_resume_id=run.source_resume_id,
        generated_resume_id=run.generated_resume_id,
        job_context_id=run.job_context_id,
        template=run.template,
        status=run.status,
        steps=run.steps or [],
        created_at=run.created_at.isoformat() if run.created_at else "",
        updated_at=run.updated_at.isoformat() if run.updated_at else None,
        artifacts=artifacts,
    )


@router.get(
    "/runs",
    response_model=list[PipelineRunDetail],
)
def list_pipeline_runs(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/pipeline/runs?limit=
    List recent pipeline runs for authenticated user.
    """
    runs = (
        db.query(PipelineRun)
        .filter(PipelineRun.user_id == current_user.id)
        .order_by(PipelineRun.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        PipelineRunDetail(
            id=r.id,
            user_id=r.user_id,
            source_resume_id=r.source_resume_id,
            generated_resume_id=r.generated_resume_id,
            job_context_id=r.job_context_id,
            template=r.template,
            status=r.status,
            steps=r.steps or [],
            created_at=r.created_at.isoformat() if r.created_at else "",
            updated_at=r.updated_at.isoformat() if r.updated_at else None,
            artifacts=None,
        )
        for r in runs
    ]
