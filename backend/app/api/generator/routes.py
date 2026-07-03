import json
import logging
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
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
    analyze_resume,
    generate_resume,
    analyze_resume_health,
    improve_resume_section,
)

router = APIRouter(prefix="/api/generator", tags=["Generator"])
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(
    payload: AnalyzeRequest,
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
        result = analyze_resume(resume.parsed_text, payload.job_description)

        # Save analysis to the database
        resume.ats_score = result.get("ats_score", 75)
        resume.analysis_results = json.dumps(result)
        matched = result.get("matched_keywords", [])
        resume.skills = ",".join(matched)

        db.commit()
        db.refresh(resume)

        return result
    except Exception as e:
        logger.exception("Failed to analyze resume")
        raise HTTPException(status_code=500, detail="Failed to analyze resume.")


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
        result = generate_resume(resume.parsed_text, payload.job_description)

        # Save new optimized resume entry
        r_data = result.get("resume", {})
        headline = r_data.get("headline", "Optimized Resume")
        summary = r_data.get("summary", "")
        skills_list = r_data.get("skills", [])

        optimized_text = f"Headline: {headline}\nSummary: {summary}\nSkills: {', '.join(skills_list)}\n"

        try:
            curr_ver = resume.version or "v1"
            match = re.search(r"v(\d+)", curr_ver)
            if match:
                new_ver = f"v{int(match.group(1)) + 1}"
            else:
                new_ver = "v2"
        except Exception:
            new_ver = "v2"

        new_ats = min(98, (resume.ats_score or 75) + 12)

        optimized_analysis = {
            "ats_score": new_ats,
            "matched_keywords": skills_list[:10],
            "missing_keywords": ["CI/CD"],
            "suggestions": [
                "Include specific metrics (e.g. 'improved performance by 20%')"
            ],
            "heatmap": {
                "contact_info": 98,
                "summary": 90,
                "skills": 95,
                "experience": 88,
                "projects": 90,
                "education": 95,
            },
        }

        new_resume = Resume(
            user_id=current_user.id,
            title=f"Optimized: {resume.title}",
            original_filename=resume.original_filename,
            file_path=resume.file_path,
            parsed_text=optimized_text,
            is_active=False,
            ats_score=new_ats,
            skills=",".join(skills_list),
            analysis_results=json.dumps(optimized_analysis),
            version=new_ver,
            template=resume.template or "Professional",
        )

        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)

        return result
    except Exception as e:
        logger.exception("Failed to generate resume")
        raise HTTPException(status_code=500, detail="Failed to generate resume.")


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
        result = analyze_resume_health(resume.parsed_text)

        health_report = (
            db.query(ResumeHealthAnalysis)
            .filter(ResumeHealthAnalysis.resume_id == resume.id)
            .first()
        )
        if not health_report:
            health_report = ResumeHealthAnalysis(resume_id=resume.id)
            db.add(health_report)

        health_report.ats_score = result.get("ats_score", 0)
        health_report.resume_health_score = result.get("resume_health_score", 0)
        health_report.formatting_score = result.get("formatting_score", 0)
        health_report.readability_score = result.get("readability_score", 0)
        health_report.skills_coverage = result.get("skills_coverage", 0)
        health_report.experience_quality = result.get("experience_quality", 0)
        health_report.projects_quality = result.get("projects_quality", 0)
        health_report.education_quality = result.get("education_quality", 0)
        health_report.keyword_optimization = result.get("keyword_optimization", 0)
        health_report.grammar_writing = result.get("grammar_writing", 0)
        health_report.section_completeness = result.get("section_completeness", 0)
        health_report.recruiter_readiness = result.get("recruiter_readiness", 0)

        health_report.suggestions = json.dumps(result.get("suggestions", {}))
        health_report.missing_sections = json.dumps(result.get("missing_sections", []))
        health_report.strengths = json.dumps(result.get("strengths", []))
        health_report.weaknesses = json.dumps(result.get("weaknesses", []))

        resume.ats_score = health_report.ats_score

        db.commit()
        db.refresh(health_report)

        return result
    except Exception as e:
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
    except Exception as e:
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
        "suggestions": (
            json.loads(health_report.suggestions) if health_report.suggestions else {}
        ),
        "missing_sections": (
            json.loads(health_report.missing_sections)
            if health_report.missing_sections
            else []
        ),
        "strengths": (
            json.loads(health_report.strengths) if health_report.strengths else []
        ),
        "weaknesses": (
            json.loads(health_report.weaknesses) if health_report.weaknesses else []
        ),
    }
