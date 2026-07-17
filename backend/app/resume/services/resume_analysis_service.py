import json
import hashlib
import logging
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.models.resume_health import ResumeHealthAnalysis
from app.resume.services.resume_normalizer import (
    normalize_resume,
    get_canonical_hash,
    canonical_resume_to_text,
    coerce_to_canonical,
)
from app.resume.services.resume_scoring_service import calculate_scores
from app.services.llm_service import call_llm_with_retry, extract_json
from app.services.ai.prompts import get_resume_health_prompt, get_ats_prompt

logger = logging.getLogger(__name__)

SCORING_VERSION = "v2"
ATS_PROMPT_VERSION = "ats-2026-07-v2"
HEALTH_PROMPT_VERSION = "health-2026-07-v2"


def _is_empty_canonical(data: dict) -> bool:
    """Check if a canonical resume dict is effectively empty (no meaningful content)."""
    if not isinstance(data, dict):
        return True
    contact = data.get("contact", {})
    has_name = bool(contact.get("name", "").strip())
    has_skills = bool(data.get("skills"))
    has_experience = bool(data.get("experience"))
    has_education = bool(data.get("education"))
    has_projects = bool(data.get("projects"))
    has_summary = bool(data.get("summary", "").strip())
    return not (
        has_name
        or has_skills
        or has_experience
        or has_education
        or has_projects
        or has_summary
    )


def parse_resume_text_to_json(resume_text: str) -> dict:
    """
    Parses the resume text using a deterministic local parser and returns
    the parsed canonical resume dict coerced to the schema.
    Never returns None - always returns at least an empty canonical structure.
    """
    if not resume_text or not resume_text.strip():
        logger.warning(
            "[LOCAL_RESUME_PARSER] Empty resume text provided, returning empty canonical."
        )
        return coerce_to_canonical({})

    try:
        from app.resume.services.local_resume_parser import parse_resume_text_locally

        logger.info("[LOCAL_RESUME_PARSER] Running local deterministic resume parser.")
        parsed = parse_resume_text_locally(resume_text)
        result = coerce_to_canonical(parsed)

        # Validate the parse result is not empty
        if _is_empty_canonical(result):
            logger.warning(
                "[LOCAL_RESUME_PARSER] Local parser returned empty/minimal canonical resume."
            )

        return result
    except Exception as e:
        logger.error(
            f"[LOCAL_RESUME_PARSER_FAILED] Error parsing resume text locally: {e}"
        )
        return coerce_to_canonical({})


def analyze_resume_canonical(
    db: Session,
    resume: Resume,
    job_description: str | None = None,
) -> dict:
    """
    Central analysis engine executing the canonical normalization, deterministic scoring,
    content-hash-based caching (scoped to the user), and qualitative LLM evaluation.
    """
    # 1. Ensure resume_json is populated
    r_json = None
    if resume.resume_json:
        try:
            r_json = json.loads(resume.resume_json)
        except Exception:
            pass

    if not r_json or _is_empty_canonical(r_json):
        if resume.parsed_text and resume.parsed_text.strip():
            logger.info(
                "[ANALYSIS] Parsing raw text to canonical JSON for resume id=%s "
                "(resume_json was %s)",
                resume.id,
                "empty" if not r_json else "missing content",
            )
            new_parsed = parse_resume_text_to_json(resume.parsed_text)

            # Only save if the new parse is better than what we have
            if not _is_empty_canonical(new_parsed):
                r_json = new_parsed
                resume.resume_json = json.dumps(r_json)
                db.commit()
                logger.info(
                    "[ANALYSIS] Successfully parsed and saved canonical JSON for resume id=%s",
                    resume.id,
                )
            elif r_json:
                # Keep existing (possibly partial) data rather than overwrite with empty
                logger.warning(
                    "[ANALYSIS] New parse returned empty result for resume id=%s. "
                    "Keeping existing resume_json.",
                    resume.id,
                )
            else:
                # Both are empty, save what we got
                r_json = new_parsed
                resume.resume_json = json.dumps(r_json)
                db.commit()
        else:
            logger.warning(
                "[ANALYSIS] No parsed_text available for resume id=%s, cannot parse.",
                resume.id,
            )
            if not r_json:
                r_json = coerce_to_canonical({})

    # 2. Normalize Canonical Resume
    normalized_resume = normalize_resume(r_json)

    # Update resume's resume_json and skills to reflect normalized form
    resume.resume_json = json.dumps(normalized_resume)
    if normalized_resume.get("skills"):
        resume.skills = ",".join(normalized_resume["skills"])

    # 3. Calculate Canonical Content Hash
    canonical_hash = get_canonical_hash(normalized_resume)
    resume.canonical_hash = canonical_hash
    resume.scoring_version = SCORING_VERSION
    resume.prompt_version = (
        ATS_PROMPT_VERSION if job_description else HEALTH_PROMPT_VERSION
    )

    # 4. Handle Job Description if provided
    normalized_jd = None
    jd_hash = None
    if job_description:
        normalized_jd = " ".join(job_description.split())
        jd_hash = hashlib.sha256(normalized_jd.encode("utf-8")).hexdigest()
        resume.jd_hash = jd_hash
    db.commit()

    # 5. Deterministic Scoring
    scores = calculate_scores(normalized_resume, normalized_jd)

    # 6. Cache Lookup (Scoped by user_id to prevent cross-user data leakage)
    if job_description:
        # ATS Analysis: Cache stored in resumes table (matching the existing db design)
        cached_resume = (
            db.query(Resume)
            .filter(
                Resume.user_id == resume.user_id,
                Resume.canonical_hash == canonical_hash,
                Resume.jd_hash == jd_hash,
                Resume.scoring_version == SCORING_VERSION,
                Resume.prompt_version == ATS_PROMPT_VERSION,
                Resume.analysis_results.isnot(None),
                Resume.id != resume.id,
            )
            .first()
        )

        if cached_resume:
            logger.info("ATS Analysis Cache Hit!")
            cached_data = json.loads(cached_resume.analysis_results)
            # Override scores with current deterministic ones (in case scoring rules changed, but versions matched)
            cached_data.update(scores)
            resume.ats_score = scores["ats_score"]
            resume.analysis_results = json.dumps(cached_data)
            db.commit()
            return cached_data
    else:
        # General Health Analysis: Cache stored in resume_health_analyses table
        cached_health = (
            db.query(ResumeHealthAnalysis)
            .join(Resume)
            .filter(
                Resume.user_id == resume.user_id,
                ResumeHealthAnalysis.canonical_hash == canonical_hash,
                ResumeHealthAnalysis.analysis_type == "health",
                ResumeHealthAnalysis.scoring_version == SCORING_VERSION,
                ResumeHealthAnalysis.prompt_version == HEALTH_PROMPT_VERSION,
                Resume.id != resume.id,
            )
            .first()
        )

        if cached_health:
            logger.info("General Health Analysis Cache Hit!")
            suggestions_data = (
                json.loads(cached_health.suggestions)
                if cached_health.suggestions
                else {}
            )

            # Reconstruct the response structure matching get_resume_health
            result = {
                "ats_score": scores["ats_score"],
                "resume_health_score": scores["resume_health_score"],
                "formatting_score": scores["formatting_score"],
                "readability_score": scores["readability_score"],
                "skills_coverage": scores["skills_coverage"],
                "experience_quality": scores["experience_quality"],
                "projects_quality": scores["projects_quality"],
                "education_quality": scores["education_quality"],
                "keyword_optimization": scores["keyword_optimization"],
                "grammar_writing": scores["grammar_writing"],
                "section_completeness": scores["section_completeness"],
                "recruiter_readiness": scores["recruiter_readiness"],
                "summary": suggestions_data.get("summary", ""),
                "formatting_status": suggestions_data.get("formatting_status", ""),
                "grammar_status": suggestions_data.get("grammar_status", ""),
                "suggestions": suggestions_data,
                "missing_sections": (
                    json.loads(cached_health.missing_sections)
                    if cached_health.missing_sections
                    else []
                ),
                "strengths": (
                    json.loads(cached_health.strengths)
                    if cached_health.strengths
                    else []
                ),
                "weaknesses": (
                    json.loads(cached_health.weaknesses)
                    if cached_health.weaknesses
                    else []
                ),
            }

            # Update current resume health report
            health_report = (
                db.query(ResumeHealthAnalysis)
                .filter(ResumeHealthAnalysis.resume_id == resume.id)
                .first()
            )
            if not health_report:
                health_report = ResumeHealthAnalysis(resume_id=resume.id)
                db.add(health_report)

            health_report.ats_score = scores["ats_score"]
            health_report.resume_health_score = scores["resume_health_score"]
            health_report.formatting_score = scores["formatting_score"]
            health_report.readability_score = scores["readability_score"]
            health_report.skills_coverage = scores["skills_coverage"]
            health_report.experience_quality = scores["experience_quality"]
            health_report.projects_quality = scores["projects_quality"]
            health_report.education_quality = scores["education_quality"]
            health_report.keyword_optimization = scores["keyword_optimization"]
            health_report.grammar_writing = scores["grammar_writing"]
            health_report.section_completeness = scores["section_completeness"]
            health_report.recruiter_readiness = scores["recruiter_readiness"]

            health_report.suggestions = cached_health.suggestions
            health_report.missing_sections = cached_health.missing_sections
            health_report.strengths = cached_health.strengths
            health_report.weaknesses = cached_health.weaknesses
            health_report.canonical_hash = canonical_hash
            health_report.scoring_version = SCORING_VERSION
            health_report.prompt_version = HEALTH_PROMPT_VERSION
            health_report.analysis_type = "health"

            resume.ats_score = scores["ats_score"]
            db.commit()
            return result

    # 7. Cache Miss: Execute LLM Call (Qualitative Only)
    serialized_text = canonical_resume_to_text(normalized_resume)

    if job_description:
        logger.info("Executing LLM call for ATS Analysis...")
        prompt_str = get_ats_prompt(serialized_text, normalized_jd)
        raw_llm = call_llm_with_retry(
            prompt_str,
            feature="ats_analysis",
            temperature=0.0,
            json_response=True,
        )
        qualitative = raw_llm if isinstance(raw_llm, dict) else extract_json(raw_llm)

        # Merge deterministic scores and LLM qualitative results
        merged_results = {
            "ats_score": scores["ats_score"],
            "matched_keywords": scores["matched_keywords"],
            "missing_keywords": scores["missing_keywords"],
            "suggestions": qualitative.get("suggestions", []),
            "heatmap": {
                "contact_info": scores["formatting_score"],
                "summary": scores["readability_score"],
                "skills": scores["skills_coverage"],
                "experience": scores["experience_quality"],
                "projects": scores["projects_quality"],
                "education": scores["education_quality"],
            },
            "strengths": qualitative.get("strengths", []),
            "weaknesses": qualitative.get("weaknesses", []),
        }

        # Save to database
        resume.ats_score = scores["ats_score"]
        resume.analysis_results = json.dumps(merged_results)
        db.commit()
        return merged_results
    else:
        logger.info("Executing LLM call for General Health Analysis...")
        prompt_str = get_resume_health_prompt(serialized_text)
        raw_llm = call_llm_with_retry(
            prompt_str,
            feature="resume_health_analysis",
            temperature=0.0,
            json_response=True,
        )
        qualitative = raw_llm if isinstance(raw_llm, dict) else extract_json(raw_llm)

        # Merge deterministic scores and LLM qualitative results
        # Ensure suggestions is a dict with quick_fixes, etc.
        sug_dict = qualitative.get("suggestions", {})
        if not isinstance(sug_dict, dict):
            sug_dict = {
                "quick_fixes": [],
                "medium_improvements": [],
                "high_impact_improvements": [],
            }

        sug_dict["summary"] = qualitative.get("summary", "")
        sug_dict["formatting_status"] = qualitative.get(
            "formatting_status", "Standard Passed"
        )
        sug_dict["grammar_status"] = qualitative.get("grammar_status", "Clean")

        missing_sections = qualitative.get("missing_sections", [])
        strengths = qualitative.get("strengths", [])
        weaknesses = qualitative.get("weaknesses", [])

        # Reconstruct response matching get_resume_health
        merged_results = {
            "ats_score": scores["ats_score"],
            "resume_health_score": scores["resume_health_score"],
            "formatting_score": scores["formatting_score"],
            "readability_score": scores["readability_score"],
            "skills_coverage": scores["skills_coverage"],
            "experience_quality": scores["experience_quality"],
            "projects_quality": scores["projects_quality"],
            "education_quality": scores["education_quality"],
            "keyword_optimization": scores["keyword_optimization"],
            "grammar_writing": scores["grammar_writing"],
            "section_completeness": scores["section_completeness"],
            "recruiter_readiness": scores["recruiter_readiness"],
            "summary": qualitative.get("summary", ""),
            "formatting_status": qualitative.get("formatting_status", ""),
            "grammar_status": qualitative.get("grammar_status", ""),
            "suggestions": sug_dict,
            "missing_sections": missing_sections,
            "strengths": strengths,
            "weaknesses": weaknesses,
        }

        # Update or create ResumeHealthAnalysis record
        health_report = (
            db.query(ResumeHealthAnalysis)
            .filter(ResumeHealthAnalysis.resume_id == resume.id)
            .first()
        )
        if not health_report:
            health_report = ResumeHealthAnalysis(resume_id=resume.id)
            db.add(health_report)

        health_report.ats_score = scores["ats_score"]
        health_report.resume_health_score = scores["resume_health_score"]
        health_report.formatting_score = scores["formatting_score"]
        health_report.readability_score = scores["readability_score"]
        health_report.skills_coverage = scores["skills_coverage"]
        health_report.experience_quality = scores["experience_quality"]
        health_report.projects_quality = scores["projects_quality"]
        health_report.education_quality = scores["education_quality"]
        health_report.keyword_optimization = scores["keyword_optimization"]
        health_report.grammar_writing = scores["grammar_writing"]
        health_report.section_completeness = scores["section_completeness"]
        health_report.recruiter_readiness = scores["recruiter_readiness"]

        health_report.suggestions = json.dumps(sug_dict)
        health_report.missing_sections = json.dumps(missing_sections)
        health_report.strengths = json.dumps(strengths)
        health_report.weaknesses = json.dumps(weaknesses)

        health_report.canonical_hash = canonical_hash
        health_report.scoring_version = SCORING_VERSION
        health_report.prompt_version = HEALTH_PROMPT_VERSION
        health_report.analysis_type = "health"
        health_report.jd_hash = None

        resume.ats_score = scores["ats_score"]
        db.commit()
        return merged_results
