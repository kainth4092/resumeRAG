import datetime
import logging
from app.core.database import SessionLocal
from app.models.pipeline_run import PipelineRun
from app.pipeline.services.context_extractor import extract_or_get_job_context
from app.pipeline.services.resume_generator import generate_tailored_resume
from app.pipeline.services.job_matcher import match_and_rank_jobs
from app.pipeline.services.interview_preparer import prepare_interview_session
from app.pipeline.services.roadmap_builder import build_pipeline_roadmap

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def _update_step(
    steps: list[dict],
    name: str,
    status: str,
    started_at: str | None = None,
    finished_at: str | None = None,
    error: str | None = None,
) -> list[dict]:
    new_steps = []
    found = False
    for s in steps:
        if s.get("name") == name:
            found = True
            entry = dict(s)
            entry["status"] = status
            if started_at:
                entry["started_at"] = started_at
            if finished_at:
                entry["finished_at"] = finished_at
            if error is not None:
                entry["error"] = error
            new_steps.append(entry)
        else:
            new_steps.append(s)
    if not found:
        new_steps.append({
            "name": name,
            "status": status,
            "started_at": started_at,
            "finished_at": finished_at,
            "error": error,
        })
    return new_steps


async def execute_pipeline_run(run_id: str, job_description: str, company: str | None = None, role: str | None = None):
    """
    Background Task runner with its OWN independent SessionLocal.
    Executes steps sequentially:
    1. extract_job_context
    2. generate_resume
    3. jobs (independent)
    4. interview (independent)
    5. roadmap (independent)
    One failure in steps 3-5 yields 'partial', never losing the generated resume.
    """
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        if not run:
            logger.error("Pipeline run id=%s not found in background task", run_id)
            return

        run.status = "running"
        step_names = [
            "extract_job_context",
            "generate_resume",
            "jobs",
            "interview",
            "roadmap",
        ]
        run.steps = [
            {"name": name, "status": "pending", "started_at": None, "finished_at": None, "error": None}
            for name in step_names
        ]
        db.commit()

        user_id = run.user_id
        template = run.template
        source_resume_id = run.source_resume_id

        # ----------------------------------------------------
        # Step 1: extract_job_context
        # ----------------------------------------------------
        run.steps = _update_step(run.steps, "extract_job_context", "running", started_at=_now_iso())
        db.commit()

        try:
            job_context = await extract_or_get_job_context(
                db=db,
                user_id=user_id,
                job_description=job_description,
                company=company,
                role=role,
            )
            run.job_context_id = job_context.id
            run.steps = _update_step(run.steps, "extract_job_context", "completed", finished_at=_now_iso())
            db.commit()
        except Exception as e:
            logger.error("Step 1 extract_job_context failed for run=%s: %s", run_id, str(e), exc_info=True)
            run.steps = _update_step(run.steps, "extract_job_context", "failed", finished_at=_now_iso(), error=str(e))
            run.status = "failed"
            db.commit()
            return

        # ----------------------------------------------------
        # Step 2: generate_resume
        # ----------------------------------------------------
        run.steps = _update_step(run.steps, "generate_resume", "running", started_at=_now_iso())
        db.commit()

        try:
            generated_resume, ats_breakdown, skill_gaps, suggested_projects = await generate_tailored_resume(
                db=db,
                user_id=user_id,
                job_context=job_context,
                source_resume_id=source_resume_id,
                template=template,
            )
            run.generated_resume_id = generated_resume.id
            run.steps = _update_step(run.steps, "generate_resume", "completed", finished_at=_now_iso())
            db.commit()
        except Exception as e:
            logger.error("Step 2 generate_resume failed for run=%s: %s", run_id, str(e), exc_info=True)
            run.steps = _update_step(run.steps, "generate_resume", "failed", finished_at=_now_iso(), error=str(e))
            run.status = "failed"
            db.commit()
            return

        # ----------------------------------------------------
        # Steps 3-5: Independent steps.
        # One failure yields status 'partial', not a lost resume.
        # ----------------------------------------------------
        has_partial_failure = False

        # Step 3: jobs
        run.steps = _update_step(run.steps, "jobs", "running", started_at=_now_iso())
        db.commit()
        try:
            await match_and_rank_jobs(
                db=db,
                user_id=user_id,
                generated_resume=generated_resume,
                job_context=job_context,
            )
            run.steps = _update_step(run.steps, "jobs", "completed", finished_at=_now_iso())
            db.commit()
        except Exception as e:
            logger.warning("Step 3 jobs matching failed for run=%s: %s", run_id, str(e))
            run.steps = _update_step(run.steps, "jobs", "failed", finished_at=_now_iso(), error=str(e))
            has_partial_failure = True
            db.commit()

        # Step 4: interview
        run.steps = _update_step(run.steps, "interview", "running", started_at=_now_iso())
        db.commit()
        try:
            prepare_interview_session(
                db=db,
                user_id=user_id,
                generated_resume=generated_resume,
                job_context=job_context,
                skill_gaps=skill_gaps,
                pipeline_run_id=run.id,
            )
            run.steps = _update_step(run.steps, "interview", "completed", finished_at=_now_iso())
            db.commit()
        except Exception as e:
            logger.warning("Step 4 interview prep failed for run=%s: %s", run_id, str(e))
            run.steps = _update_step(run.steps, "interview", "failed", finished_at=_now_iso(), error=str(e))
            has_partial_failure = True
            db.commit()

        # Step 5: roadmap
        run.steps = _update_step(run.steps, "roadmap", "running", started_at=_now_iso())
        db.commit()
        try:
            build_pipeline_roadmap(
                db=db,
                user_id=user_id,
                generated_resume=generated_resume,
                job_context=job_context,
                suggested_projects=suggested_projects,
            )
            run.steps = _update_step(run.steps, "roadmap", "completed", finished_at=_now_iso())
            db.commit()
        except Exception as e:
            logger.warning("Step 5 roadmap generation failed for run=%s: %s", run_id, str(e))
            run.steps = _update_step(run.steps, "roadmap", "failed", finished_at=_now_iso(), error=str(e))
            has_partial_failure = True
            db.commit()

        run.status = "partial" if has_partial_failure else "completed"
        db.commit()
        logger.info("Pipeline run=%s finished with status=%s", run_id, run.status)

    except Exception as e:
        logger.error("Unhandled fatal exception in pipeline runner id=%s: %s", run_id, str(e), exc_info=True)
        try:
            run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
            if run:
                run.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
