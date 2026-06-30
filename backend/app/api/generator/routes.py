import json
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.resume import Resume
from app.models.user import User
from app.schemas.generator import (
    AnalyzeRequest,
    AnalyzeResponse,
    GenerateRequest,
    GenerateResponse,
)
from app.services.llm_service import analyze_resume, generate_resume

router = APIRouter(prefix="/api/generator", tags=["Generator"])


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
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze resume: {str(e)}"
        )


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
            "suggestions": ["Include specific metrics (e.g. 'improved performance by 20%')"],
            "heatmap": {
                "contact_info": 98,
                "summary": 90,
                "skills": 95,
                "experience": 88,
                "projects": 90,
                "education": 95
            }
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
            template=resume.template or "Professional"
        )
        
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to generate resume: {str(e)}"
        )
