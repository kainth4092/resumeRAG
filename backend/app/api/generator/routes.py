import json
import logging
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import AppException
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
def analyze(
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
def generate(
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
        source_resume_text = resume.parsed_text or ""
        if resume.resume_json:
            try:
                stored_resume = json.loads(resume.resume_json)

                if isinstance(stored_resume, dict) and stored_resume:
                    contact = stored_resume.get("contact", {})
                    has_name = (
                        bool(contact.get("name", "").strip())
                        if isinstance(contact, dict)
                        else False
                    )
                    has_skills = bool(stored_resume.get("skills"))
                    has_experience = bool(stored_resume.get("experience"))
                    has_projects = bool(stored_resume.get("projects"))

                    if has_name or has_skills or has_experience or has_projects:
                        source_resume_text = json.dumps(
                            stored_resume,
                            ensure_ascii=False,
                            indent=2,
                        )
                    else:
                        logger.warning(
                            "resume_json for resume id=%s is empty/incomplete; falling back to parsed_text.",
                            resume.id,
                        )
            except (TypeError, ValueError, json.JSONDecodeError):
                logger.warning(
                    "Invalid resume_json for resume id=%s; using parsed_text.",
                    resume.id,
                )

        if not source_resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail="The selected resume does not contain usable content.",
            )

        logger.info(
            "[GENERATOR_SOURCE] user_id=%s resume_id=%s parsed_len=%d",
            current_user.id,
            resume.id,
            len(source_resume_text),
        )

        result = generate_resume(
            source_resume_text,
            payload.job_description,
        )
        r_data = result.get("resume", {})
        if not isinstance(r_data, dict) or not r_data:
            raise HTTPException(
                status_code=502,
                detail="The AI returned an invalid resume. Please try again.",
            )

        # Validate the generated resume has meaningful content
        pi = r_data.get("personal_info", {})
        has_name = bool(pi.get("name", "").strip()) if isinstance(pi, dict) else False
        has_skills = bool(r_data.get("skills"))
        has_experience = bool(r_data.get("experience"))
        if not (has_name or has_skills or has_experience):
            logger.error(
                "[GENERATOR_EMPTY] Generated resume has no name, skills, or experience. "
                "resume_id=%s r_data_keys=%s",
                resume.id,
                list(r_data.keys()),
            )
            raise HTTPException(
                status_code=502,
                detail="The AI returned an incomplete resume. Please try again.",
            )

        # Get clean name from r_data
        pi = r_data.get("personal_info", {}) or {}
        contact = r_data.get("contact", {}) or {}
        name = ""
        if isinstance(pi, dict):
            name = pi.get("name", "").strip()
        if not name and isinstance(contact, dict):
            name = contact.get("name", "").strip()

        if not name:
            name = (current_user.name or "").strip() or resume.title

        # Clean title using standard cleaning
        cleaned_title = name
        if cleaned_title:
            cleaned_title = re.sub(
                r"^Optimized:\s*", "", cleaned_title, flags=re.IGNORECASE
            )
            cleaned_title = re.sub(
                r"\.(pdf|docx|doc)$", "", cleaned_title, flags=re.IGNORECASE
            )
            cleaned_title = re.sub(r"[_-]+", " ", cleaned_title)
            cleaned_title = re.sub(
                r"\bresume\b.*$", "", cleaned_title, flags=re.IGNORECASE
            )
            cleaned_title = re.sub(r"\s+", " ", cleaned_title).strip()

        # Ensure headline is preserved if generated one is empty
        gen_headline = r_data.get("headline", "").strip()
        if not gen_headline:
            orig_headline = ""
            if resume.resume_json:
                try:
                    orig_json = json.loads(resume.resume_json)
                    orig_headline = (
                        orig_json.get("headline")
                        or orig_json.get("personal_info", {}).get("headline")
                        or ""
                    ).strip()
                except Exception:
                    pass
            if orig_headline:
                r_data["headline"] = orig_headline
            else:
                r_data["headline"] = "Optimized Resume"



        # Calculate real ATS scores using deterministic scoring against JD
        from app.resume.services.resume_scoring_service import calculate_scores

        scores = calculate_scores(r_data, payload.job_description)
        new_ats = scores.get("ats_score", 75)
        # ----------------------------------------------------------
        # Validate generated resume quality before saving
        # ----------------------------------------------------------

        matched_keywords = scores.get("matched_keywords", [])
        missing_keywords = scores.get("missing_keywords", [])
        coverage = len(matched_keywords) / max(
            len(matched_keywords) + len(missing_keywords),
            1,
        )
        quality_report = {
            "ats": new_ats,
            "coverage": round(coverage * 100, 2),
            "matched": len(matched_keywords),
            "missing": len(missing_keywords),
        }
        logger.info(
            "[GENERATOR VALIDATION] %s",
            quality_report,
        )
        if new_ats < 80:
            logger.warning(
                "[LOW ATS GENERATED] ATS=%s Coverage=%.2f%%",
                new_ats,
                coverage * 100,
            )
        if coverage < 0.70:
            logger.warning(
                "[LOW JD COVERAGE] %.2f%% keywords matched",
                coverage * 100,
            )

        # ----------------------------------------------------------
        # Retry generation once if the generated resume quality is low
        # ----------------------------------------------------------
        if new_ats < 90 and coverage < 0.85:
            logger.info(
                "[GENERATOR RETRY] ATS=%s Coverage=%.2f%% - requesting one improved generation.",
                new_ats,
                coverage * 100,
            )
            feedback = f"""
            The previous generated resume achieved:           
            ATS Score: {new_ats}
            Matched Keywords:
            {', '.join(matched_keywords)}     
            Missing Keywords:
            {', '.join(missing_keywords)} 
            Improve the resume by naturally increasing coverage of supported missing keywords.
            Do not invent employment, companies, experience, projects, certifications, or skills.
            Strengthen the summary, skills ordering, experience bullets, and project descriptions where supported by the original resume.
            """

            retry_result = generate_resume(
                source_resume_text,
                payload.job_description,
                improvement_feedback=feedback,
            )
            retry_resume = retry_result.get("resume", {})
            if isinstance(retry_resume, dict) and retry_resume:
                retry_scores = calculate_scores(
                    retry_resume,
                    payload.job_description,
                )

                retry_ats = retry_scores.get("ats_score", 0)
                if retry_ats > new_ats:
                    logger.info(
                        "[GENERATOR RETRY SUCCESS] ATS improved %s -> %s",
                        new_ats,
                        retry_ats,
                    )

                    r_data = retry_resume
                    scores = retry_scores
                    new_ats = retry_ats


        from app.resume.repository.resume_repository import ResumeRepository
        from app.resume.services.resume_normalizer import (
            canonical_resume_to_text,
            get_canonical_hash,
            normalize_resume,
        )

        normalized_data = normalize_resume(r_data)
        serialized_json = json.dumps(normalized_data)
        parsed_text = canonical_resume_to_text(normalized_data)
        c_hash = get_canonical_hash(normalized_data)

        new_resume = Resume(
            user_id=current_user.id,
            title=f"Tailored - {cleaned_title[:80]}",
            original_filename=f"{cleaned_title[:60]}_tailored.pdf",
            file_path="generated",
            file_type="json",
            parsed_text=parsed_text,
            resume_json=serialized_json,
            skills=",".join(normalized_data.get("skills", [])),
            ats_score=new_ats,
            version="v1",
            template="Professional",
            is_generated=True,
            is_master=False,
            starred=False,
            parsing_status="completed",
            canonical_hash=c_hash,
            content_hash=c_hash,
        )
        saved_resume = ResumeRepository.create_resume(db, new_resume)

        return {"resume": normalized_data, "resume_id": saved_resume.id}


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
def analyze_health(
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
def improve_section(
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
