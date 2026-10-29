import logging
import math
import re
from typing import Any
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.models.job_context import JobContext
from app.models.resume_job_match import ResumeJobMatch
from app.models.user import User
from app.schemas.resume_doc import to_resume_doc, ResumeDoc
from app.jobs.services.jsearch_service import JSearchService, _is_expired
from app.core.skills_taxonomy import SKILLS_TAXONOMY
from app.core.exceptions import JobsProviderError

logger = logging.getLogger(__name__)

# Lazy singleton for fastembed model to avoid reloading weights on every request
_EMBEDDING_MODEL = None


def get_embedding_model():
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        try:
            from fastembed import TextEmbedding
            _EMBEDDING_MODEL = TextEmbedding()
        except Exception as e:
            logger.warning("Could not initialize fastembed TextEmbedding: %s", str(e))
            _EMBEDDING_MODEL = None
    return _EMBEDDING_MODEL


def cosine_similarity(vec_a: Any, vec_b: Any) -> float:
    if vec_a is None or vec_b is None:
        return 0.0
    if len(vec_a) == 0 or len(vec_b) == 0 or len(vec_a) != len(vec_b):
        return 0.0
    dot = float(sum(a * b for a, b in zip(vec_a, vec_b)))
    norm_a = math.sqrt(float(sum(a * a for a in vec_a)))
    norm_b = math.sqrt(float(sum(b * b for b in vec_b)))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))


def extract_skills_from_text(text: str) -> list[str]:
    """Find taxonomy canonical skills present in job text."""
    if not text:
        return []
    text_lower = f" {text.lower()} "
    found = []
    for entry in SKILLS_TAXONOMY.values():
        canonical = entry.canonical_name
        if f" {canonical.lower()} " in text_lower:
            found.append(canonical)
        else:
            for alias in entry.aliases:
                if f" {alias.lower()} " in text_lower:
                    found.append(canonical)
                    break
    return list(dict.fromkeys(found))


def compute_title_similarity(target_title: str, job_title: str) -> float:
    if not target_title or not job_title:
        return 0.5
    tokens_target = set(re.findall(r"\w+", target_title.lower()))
    tokens_job = set(re.findall(r"\w+", job_title.lower()))
    if not tokens_target or not tokens_job:
        return 0.5
    overlap = len(tokens_target.intersection(tokens_job))
    return min(1.0, overlap / max(len(tokens_target), 1))


def build_one_line_why(matched: list[str], title_sim: float, job_title: str) -> str:
    top_matches = ", ".join(matched[:3])
    if top_matches and title_sim > 0.4:
        return f"High role alignment as {job_title} with proven skills in {top_matches}."
    elif top_matches:
        return f"Matches key job requirements for {top_matches}."
    return f"Role matches your experience profile for {job_title}."


def rank_jobs_for_resume(
    resume_doc: ResumeDoc,
    jobs_list: list[dict],
    target_title: str | None = None,
    job_context: JobContext | None = None,
    resume_text: str | None = None,
) -> list[dict[str, Any]]:
    """
    Rank a list of jobs for a resume using:
    0.5 * FastEmbed cosine similarity + 0.3 * skill overlap + 0.2 * title similarity.
    """
    if not jobs_list:
        return []

    title = target_title or resume_doc.headline or "Software Engineer"
    text = resume_text or f"{resume_doc.headline or ''} {' '.join(resume_doc.skills)}"
    resume_skill_set = {s.lower() for s in resume_doc.skills}

    embed_model = get_embedding_model()
    resume_emb = None
    job_embs = []

    if embed_model:
        try:
            resume_emb = list(embed_model.embed([text[:2000]]))[0]
            desc_texts = [(j.get("job_description") or j.get("job_title") or "")[:2000] for j in jobs_list]
            job_embs = list(embed_model.embed(desc_texts))
        except Exception as e:
            logger.warning("FastEmbed embedding batch failed: %s. Using lexical scoring.", str(e))
            resume_emb = None
            job_embs = []

    scored_jobs = []

    for idx, job in enumerate(jobs_list):
        job_desc = job.get("job_description") or ""
        job_title = job.get("job_title") or ""

        # 1. Cosine similarity (0.5 weight)
        if resume_emb is not None and idx < len(job_embs):
            cos_sim = cosine_similarity(resume_emb, job_embs[idx])
        else:
            shared_words = set(re.findall(r"\w+", text.lower())).intersection(
                set(re.findall(r"\w+", job_desc.lower()))
            )
            cos_sim = min(1.0, len(shared_words) / 80)

        # 2. Taxonomy skill overlap (0.3 weight)
        job_skills = extract_skills_from_text(f"{job_title} {job_desc}")
        if not job_skills and job_context and job_context.required_skills:
            job_skills = job_context.required_skills

        matched_skills = [s for s in job_skills if s.lower() in resume_skill_set]
        missing_skills = [s for s in job_skills if s.lower() not in resume_skill_set]

        skill_overlap = len(matched_skills) / max(1, len(job_skills)) if job_skills else 0.5

        # 3. Title similarity (0.2 weight)
        title_sim = compute_title_similarity(title, job_title)

        raw_score = (0.5 * cos_sim) + (0.3 * skill_overlap) + (0.2 * title_sim)
        final_score = round(raw_score * 100, 1)

        why_text = build_one_line_why(matched_skills, title_sim, job_title)

        scored_jobs.append({
            "job_id": job.get("job_id"),
            "job": job,
            "score": final_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "why": why_text,
        })

    scored_jobs.sort(key=lambda x: x["score"], reverse=True)
    return scored_jobs[:30]


async def match_and_rank_jobs(
    db: Session,
    user_id: int,
    generated_resume: Resume,
    job_context: JobContext,
) -> list[dict[str, Any]]:
    """
    Step 3: Query JSearch with 2-3 query variants, dedupe, drop expired,
    and rank top 30 jobs via 0.5*cosine(fastembed) + 0.3*skill overlap + 0.2*title similarity.
    Persist matches to resume_job_matches.
    """
    resume_doc = to_resume_doc(generated_resume.resume_json or generated_resume.parsed_text)
    user = db.query(User).filter(User.id == user_id).first()
    location_pref = (user.profile.location if user and user.profile else None) or job_context.location or None

    target_title = job_context.title or resume_doc.headline or "Software Engineer"
    top_skills = resume_doc.skills[:5]

    # Build 2-3 query variants
    query_variants = [target_title]
    if len(top_skills) >= 2:
        query_variants.append(f"{target_title} {top_skills[0]}")
        query_variants.append(f"{target_title} {top_skills[1]}")
    elif len(top_skills) == 1:
        query_variants.append(f"{target_title} {top_skills[0]}")

    all_jobs: dict[str, dict] = {}

    for query in query_variants:
        try:
            results = await JSearchService.search_jobs(
                db=db,
                query=query,
                location=location_pref,
                date_posted="month",
                page=1,
            )
            for j in results:
                job_dict = j.model_dump() if hasattr(j, "model_dump") else (j if isinstance(j, dict) else j.__dict__)
                job_id = job_dict.get("job_id")
                if not job_id:
                    continue
                if _is_expired(job_dict):
                    continue
                if job_id not in all_jobs:
                    all_jobs[job_id] = job_dict
        except JobsProviderError:
            raise
        except Exception as e:
            logger.warning("Query variant '%s' failed in job search: %s", query, str(e))

    if not all_jobs:
        logger.warning("No jobs retrieved from JSearch for queries %s", query_variants)
        return []

    jobs_list = list(all_jobs.values())
    resume_text = generated_resume.parsed_text or ""

    top_30 = rank_jobs_for_resume(
        resume_doc=resume_doc,
        jobs_list=jobs_list,
        target_title=target_title,
        job_context=job_context,
        resume_text=resume_text,
    )

    # Save to resume_job_matches table
    # Clear prior matches for this resume if re-running
    db.query(ResumeJobMatch).filter(ResumeJobMatch.resume_id == generated_resume.id).delete()

    for item in top_30:
        j = item["job"]
        match_record = ResumeJobMatch(
            resume_id=generated_resume.id,
            job_id=str(j.get("job_id")),
            score=item["score"],
            matched_skills=item["matched_skills"],
            missing_skills=item["missing_skills"],
            reasons=[item["why"]],
            job_data=j,
        )
        db.add(match_record)

    db.commit()
    return top_30
