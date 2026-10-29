import json
import logging
import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import AppException
from app.core.limiter import limiter
from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.models.user import User
from app.schemas.generator import (
    AnalyzeRequest,
    AnalyzeResponse,
    GenerateRequest,
    GenerateResponse,
    AnalyzeHealthRequest,
    ImproveSectionRequest,
)
from app.services.llm_service import (
    generate_resume,
    improve_resume_section,
)
from app.services.notification_service import create_notification


router = APIRouter(prefix="/api/generator", tags=["Generator"])
logger = logging.getLogger(__name__)


def safe_json_loads(
    value,
    default,
):
    """Safely decode JSON stored in legacy database rows."""

    if value is None or value == "":
        return default

    if isinstance(
        value,
        type(default),
    ):
        return value

    try:
        parsed = json.loads(value)
    except (
        TypeError,
        ValueError,
        json.JSONDecodeError,
    ):
        logger.warning("Invalid stored JSON encountered " "in generator health data.")
        return default

    if not isinstance(
        parsed,
        type(default),
    ):
        logger.warning("Unexpected stored JSON type in " "generator health data.")
        return default

    return parsed


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/minute")
def analyze(
    request: Request,
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == payload.resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        from app.resume.services.resume_analysis_service import (
            analyze_resume_canonical,
        )

        result = analyze_resume_canonical(
            db,
            resume,
            payload.job_description,
        )
        create_notification(
            db=db,
            user_id=current_user.id,
            title="Resume analysis ready",
            message=f'Your resume "{resume.title}" has been analyzed successfully.',
            notification_type="resume_analysis",
            action_url=f"/resumes/{resume.id}",
        )

        return result
    except HTTPException:
        raise
    except AppException:
        raise
    except Exception as exc:
        logger.exception("Failed to analyze resume")
        raise HTTPException(
            status_code=500,
            detail=(
                "We couldn't analyze your resume right now. "
                "Please verify that your resume contains readable text and "
                "that the job description is complete, then try again."
            ),
        ) from exc


@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("10/minute")
def generate(
    request: Request,
    payload: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text
        from app.resume.services.resume_scoring_service import calculate_scores
        from app.resume.repository.resume_repository import ResumeRepository
        import hashlib

        # Extract source resume document
        if resume.resume_json:
            try:
                stored = json.loads(resume.resume_json)
                source_doc = to_resume_doc(stored)
            except Exception:
                source_doc = to_resume_doc({})
        elif resume.parsed_text and resume.parsed_text.strip():
            from app.resume.services.resume_parsing_pipeline import parse_resume_pipeline
            source_doc, _ = parse_resume_pipeline(resume.parsed_text)
        else:
            raise HTTPException(
                status_code=422,
                detail="The selected resume does not contain usable content.",
            )

        logger.info(
            "[GENERATOR_SOURCE] user_id=%s resume_id=%s skills_count=%d",
            current_user.id,
            resume.id,
            len(source_doc.skills),
        )

        result = generate_resume(
            source_doc,
            payload.job_description,
        )
        r_data = result.get("resume", {})
        if not isinstance(r_data, dict) or not r_data:
            raise HTTPException(
                status_code=502,
                detail="The AI returned an invalid resume. Please try again.",
            )

        doc = to_resume_doc(r_data)

        # Name & Title
        name = doc.contact.name.strip() or (current_user.name or "").strip() or resume.title
        cleaned_title = re.sub(r"^Optimized:\s*", "", name, flags=re.IGNORECASE)
        cleaned_title = re.sub(r"\.(pdf|docx|doc)$", "", cleaned_title, flags=re.IGNORECASE)
        cleaned_title = re.sub(r"[_-]+", " ", cleaned_title)
        cleaned_title = re.sub(r"\bresume\b.*$", "", cleaned_title, flags=re.IGNORECASE)
        cleaned_title = re.sub(r"\s+", " ", cleaned_title).strip() or "Tailored Resume"

        # Deterministic scoring against target JD
        scores = calculate_scores(doc, payload.job_description)
        new_ats = scores.get("ats_score", 75)

        text_repr = resume_doc_to_text(doc)
        c_hash = hashlib.sha256(text_repr.encode("utf-8")).hexdigest()

        new_resume = Resume(
            user_id=current_user.id,
            title=f"Tailored - {cleaned_title[:80]}",
            original_filename=f"{cleaned_title[:60]}_tailored.pdf",
            file_path="generated",
            parsed_text=text_repr,
            resume_json=doc.model_dump_json(),
            skills=",".join(doc.skills),
            ats_score=new_ats,
            version="v1",
            template="Professional",
            is_generated=True,
            starred=False,
            parsing_status="completed",
            canonical_hash=c_hash,
            content_hash=c_hash,
            scoring_version="v1",
            prompt_version="v1",
        )
        saved_resume = ResumeRepository.create_resume(db, new_resume)

        return GenerateResponse(
            resume=doc,
            resume_id=saved_resume.id,
            suggested_projects=result.get("suggested_projects", []),
            skill_gaps=result.get("skill_gaps", []),
        )


    except HTTPException as e:
        raise e
    except AppException as e:
        raise e
    except Exception as exc:
        logger.exception("Failed to generate resume")
        raise HTTPException(
            status_code=500, detail="Failed to generate resume."
        ) from exc


@router.post("/analyze-health")
@limiter.limit("10/minute")
def analyze_health(
    request: Request,
    payload: AnalyzeHealthRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        from app.resume.services.resume_analysis_service import analyze_resume_canonical

        result = analyze_resume_canonical(db, resume, None)
        return result
    except HTTPException as e:
        raise e
    except AppException as e:
        raise e
    except Exception:
        logger.exception("Failed to analyze resume health")
        raise HTTPException(status_code=500, detail="Failed to analyze resume health.")


@router.post("/improve-section")
@limiter.limit("10/minute")
def improve_section(
    request: Request,
    payload: ImproveSectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        improved_text = improve_resume_section(
            resume_text=resume.parsed_text,
            section_name=payload.section_name,
            section_content=payload.content,
        )
        return {"improved_text": improved_text}
    except HTTPException as e:
        raise e
    except AppException as e:
        raise e
    except Exception:
        logger.exception("Failed to improve section with AI")
        raise HTTPException(
            status_code=500,
            detail="Failed to improve section with AI.",
        )


@router.get("/{resume_id}/health")
def get_resume_health(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    health_report = (
        db.query(ResumeHealthAnalysis)
        .filter(ResumeHealthAnalysis.resume_id == resume_id)
        .first()
    )
    if not health_report:
        return None

    suggestions_data = safe_json_loads(
        health_report.suggestions,
        {},
    )
    return {
        "ats_score": health_report.ats_score,
        "resume_health_score": health_report.resume_health_score,
        "formatting_score": health_report.formatting_score,
        "readability_score": health_report.readability_score,
        "skills_coverage": health_report.skills_coverage,
        "experience_quality": health_report.experience_quality,
        "projects_quality": health_report.projects_quality,
        "education_quality": health_report.education_quality,
        "keyword_optimization": health_report.keyword_optimization,
        "grammar_writing": health_report.grammar_writing,
        "section_completeness": health_report.section_completeness,
        "recruiter_readiness": health_report.recruiter_readiness,
        "summary": suggestions_data.get("summary", ""),
        "formatting_status": suggestions_data.get("formatting_status", ""),
        "grammar_status": suggestions_data.get("grammar_status", ""),
        "suggestions": suggestions_data,
        "missing_sections": safe_json_loads(
            health_report.missing_sections,
            [],
        ),
        "strengths": safe_json_loads(
            health_report.strengths,
            [],
        ),
        "weaknesses": safe_json_loads(
            health_report.weaknesses,
            [],
        ),
    }
