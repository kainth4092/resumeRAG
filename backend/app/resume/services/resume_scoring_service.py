import hashlib
import json
import logging
import re
from typing import Any, List, Set, Dict

from sqlalchemy.orm import Session
from app.core.skills_taxonomy import normalize_skill, extract_skills_from_text
from app.schemas.resume_doc import to_resume_doc, resume_doc_to_text, ResumeDoc

logger = logging.getLogger(__name__)


def get_or_extract_jd_keywords(job_description: str, db: Session | None = None) -> List[str]:
    """
    Extracts tech keywords from job description once per jd_hash,
    caching the result in the job_contexts database table.
    """
    if not job_description or not job_description.strip():
        return []

    clean_jd = job_description.strip()
    jd_hash = hashlib.sha256(clean_jd.encode("utf-8")).hexdigest()

    # 1. Check database cache
    if db is not None:
        try:
            from app.models.job_context import JobContext
            row = db.query(JobContext).filter(JobContext.jd_hash == jd_hash).first()
            if row and row.keywords_json:
                kws = row.keywords_json if isinstance(row.keywords_json, list) else json.loads(row.keywords_json)
                return [normalize_skill(k) for k in kws if k]
        except Exception as e:
            logger.warning("[SCORING_CACHE] Failed to read job_contexts cache: %s", e)

    # 2. Extract keywords via LLM or deterministic taxonomy fallback
    keywords: List[str] = []
    try:
        from app.services.llm_service import llm_json
        prompt = (
            "Extract all technical skills, frameworks, tools, libraries, databases, and core domain keywords "
            "from the following job description as a JSON array of strings (e.g. [\"Python\", \"FastAPI\", \"Docker\"]):\n\n"
            f"{clean_jd}"
        )
        extracted = llm_json(
            prompt=prompt,
            feature="jd_keyword_extraction",
            temperature=0.0,
            timeout=15.0,
        )
        if isinstance(extracted, list):
            keywords = [str(k).strip() for k in extracted if str(k).strip()]
    except Exception as llm_err:
        logger.info("[SCORING_KEYWORD_EXTRACTION] LLM extraction unavailable (%s), using taxonomy extraction", llm_err)

    if not keywords:
        keywords = extract_skills_from_text(clean_jd)

    # Normalize through centralized taxonomy and deduplicate
    normalized_set = set()
    for kw in keywords:
        canon = normalize_skill(kw)
        if canon:
            normalized_set.add(canon)

    final_keywords = sorted(list(normalized_set))

    # 3. Cache into job_contexts table if DB session available
    if db is not None and final_keywords:
        try:
            from app.models.job_context import JobContext
            context_row = JobContext(jd_hash=jd_hash, keywords_json=final_keywords)
            db.merge(context_row)
            db.commit()
        except Exception as cache_err:
            db.rollback()
            logger.warning("[SCORING_CACHE] Failed to write to job_contexts cache: %s", cache_err)

    return final_keywords


def calculate_scores(
    resume: Any,
    job_description: str | None = None,
    db: Session | None = None,
) -> Dict[str, Any]:
    """
    Computes deterministic, explainable ATS and section scores for a resume.
    Returns:
    - ats_score: 0-100 overall score
    - keyword_coverage: percentage of JD keywords matched
    - matched_keywords: list of matched canonical skills
    - missing_keywords: list of missing canonical skills
    - section_scores: dict containing individual section qualities
    - reasons: explainable feedback points
    """
    doc: ResumeDoc = to_resume_doc(resume)

    # 1. Section Completeness (Max 100)
    completeness = 0
    if doc.contact.name:
        completeness += 15
    if doc.contact.email:
        completeness += 15
    if doc.contact.phone:
        completeness += 10
    if doc.headline or doc.summary:
        completeness += 20
    if doc.skills:
        completeness += 15
    if doc.experience:
        completeness += 15
    if doc.education:
        completeness += 10
    section_completeness = min(100, completeness)

    # 2. Skills Coverage (Max 100)
    skills_count = len(doc.skills)
    if skills_count >= 12:
        skills_coverage = 95
    elif skills_count >= 8:
        skills_coverage = 85
    elif skills_count >= 5:
        skills_coverage = 75
    elif skills_count >= 2:
        skills_coverage = 60
    else:
        skills_coverage = 40

    # 3. Experience Quality (Max 100)
    exp_quality = 50
    if doc.experience:
        exp_quality = 70
        total_bullets = sum(len(e.bullets) for e in doc.experience)
        if total_bullets >= 4:
            exp_quality += 15
        metric_bullets = 0
        for e in doc.experience:
            for b in e.bullets:
                if re.search(r"\b\d+(?:\.\d+)?%?\b", b):
                    metric_bullets += 1
        if metric_bullets >= 2:
            exp_quality += 15
    experience_quality = min(100, exp_quality)

    # 4. Projects Quality (Max 100)
    proj_quality = 50
    if doc.projects:
        proj_quality = 70
        if any(p.technologies for p in doc.projects):
            proj_quality += 15
        if any(p.bullets for p in doc.projects):
            proj_quality += 15
    projects_quality = min(100, proj_quality)

    # 5. Education Quality (Max 100)
    edu_quality = 50
    if doc.education:
        edu_quality = 75
        if any(ed.degree and ed.institution for ed in doc.education):
            edu_quality += 15
        if any(ed.start or ed.end for ed in doc.education):
            edu_quality += 10
    education_quality = min(100, edu_quality)

    # 6. Formatting Score (Max 100)
    formatting = 90
    if not doc.contact.email or not doc.contact.phone:
        formatting -= 15
    all_bullets = [b for e in doc.experience for b in e.bullets] + [b for p in doc.projects for b in p.bullets]
    for b in all_bullets:
        if len(b) > 350 or len(b) < 15:
            formatting -= 2
    formatting_score = max(50, min(100, formatting))

    # 7. Readability Score (Max 100)
    readability = 95
    summary_words = len(doc.summary.split()) if doc.summary else 0
    if summary_words > 120:
        readability -= 20
    elif summary_words < 20 and doc.summary:
        readability -= 10
    if len(all_bullets) > 30:
        readability -= 15
    readability_score = max(50, min(100, readability))

    grammar_writing = max(60, min(100, 95 - (100 - readability_score) // 5))

    # 8. Recruiter Readiness
    recruiter_readiness = int(
        0.35 * experience_quality
        + 0.25 * projects_quality
        + 0.15 * education_quality
        + 0.25 * section_completeness
    )

    # 9. Health Score
    resume_health_score = int(
        0.20 * section_completeness
        + 0.20 * experience_quality
        + 0.15 * skills_coverage
        + 0.15 * projects_quality
        + 0.10 * readability_score
        + 0.10 * formatting_score
        + 0.10 * grammar_writing
    )

    # 10. Keyword Optimization & ATS Score
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    keyword_coverage = 0.0
    reasons: List[str] = []

    if job_description and job_description.strip():
        jd_keywords = get_or_extract_jd_keywords(job_description, db)

        # Build candidate skills set
        resume_skills_set: Set[str] = {normalize_skill(s) for s in doc.skills if s}
        # Also include skills found in bullets/projects
        full_text = resume_doc_to_text(doc)
        text_skills = extract_skills_from_text(full_text)
        resume_skills_set.update(text_skills)

        matched_set = {k for k in jd_keywords if normalize_skill(k) in resume_skills_set}
        missing_set = {k for k in jd_keywords if normalize_skill(k) not in resume_skills_set}

        matched_keywords = sorted(list(matched_set))
        missing_keywords = sorted(list(missing_set))

        coverage_ratio = len(matched_keywords) / max(len(jd_keywords), 1)
        keyword_coverage = round(coverage_ratio * 100, 1)
        keyword_optimization = int(coverage_ratio * 100)

        ats_score = int(
            0.40 * keyword_optimization
            + 0.20 * experience_quality
            + 0.15 * projects_quality
            + 0.10 * skills_coverage
            + 0.10 * section_completeness
            + 0.05 * readability_score
        )

        reasons.append(
            f"Matched {len(matched_keywords)} of {len(jd_keywords)} target skills from job requirements ({keyword_coverage}% coverage)."
        )
        if missing_keywords:
            reasons.append(f"Missing required skills: {', '.join(missing_keywords[:6])}{'...' if len(missing_keywords) > 6 else ''}.")
        if len(doc.experience) >= 2:
            reasons.append(f"Solid work history with {len(doc.experience)} roles documented.")
        if formatting_score >= 85:
            reasons.append("Clean formatting with compliant bullet lengths and structure.")
    else:
        keyword_optimization = int(0.6 * skills_coverage + 0.4 * section_completeness)
        keyword_coverage = float(keyword_optimization)
        ats_score = int(
            0.35 * resume_health_score
            + 0.25 * experience_quality
            + 0.20 * projects_quality
            + 0.10 * skills_coverage
            + 0.10 * section_completeness
        )
        reasons.append("Evaluated against general ATS industry standards (no target job description supplied).")
        reasons.append(f"Overall section completeness is at {section_completeness}%.")

    section_scores = {
        "formatting": formatting_score,
        "readability": readability_score,
        "skills": skills_coverage,
        "experience": experience_quality,
        "projects": projects_quality,
        "education": education_quality,
    }

    return {
        "ats_score": ats_score,
        "keyword_coverage": keyword_coverage,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "section_scores": section_scores,
        "reasons": reasons,
        "formatting_score": formatting_score,
        "readability_score": readability_score,
        "skills_coverage": skills_coverage,
        "experience_quality": experience_quality,
        "projects_quality": projects_quality,
        "education_quality": education_quality,
        "keyword_optimization": keyword_optimization,
        "grammar_writing": grammar_writing,
        "section_completeness": section_completeness,
        "recruiter_readiness": recruiter_readiness,
        "resume_health_score": resume_health_score,
    }
