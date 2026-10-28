import json
import logging
from typing import Optional
from pydantic import BaseModel, Field
from app.services.llm_service import (
    call_llm_with_retry,
    extract_json,
    llm_json,
)

logger = logging.getLogger(__name__)


class TargetedQuestionItem(BaseModel):
    question: str
    category: str = Field(default="Project", description="Must be 'Project', 'Experience', or 'Gap'")
    difficulty: str = Field(default="Medium", description="Easy, Medium, or Hard")
    estimated_duration: str = Field(default="3-5 minutes")
    tech_skill: Optional[str] = None


class TargetedInterviewResponse(BaseModel):
    candidate_type: str = Field(default="EXPERIENCED", description="FRESHER or EXPERIENCED")
    questions: list[TargetedQuestionItem] = Field(
        default_factory=list,
        description="List of targeted project, experience, or gap questions (maximum 12)",
    )


def _to_list(value):
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [value]


def _normalize_question(question: dict, category: str):
    return {
        "question": question.get("question", "").strip(),
        "category": category,
        "difficulty": question.get("difficulty", "Medium"),
        "estimated_duration": question.get("estimated_duration", "2-3 minutes"),
        "tech_skill": question.get("tech_skill", "").strip() or None,
    }


def generate_interview_questions(
    resume_text: str,
    job_description: str,
    target_count: int = 12,
):
    """
    Generate personalized interview questions focusing exclusively on:
    1. Project deep-dives from the active resume
    2. Candidate experience and leadership
    3. Identified skill gaps between resume and target JD

    Caps questions at <= 12 to guarantee sub-minute response without JSON truncation.
    Remaining technical catalog questions are loaded directly from DB/Qdrant.
    """
    count = min(max(1, target_count), 12)
    prompt = f"""
You are an expert technical interviewer creating personalized interview questions tailored to the candidate's actual projects, work experience, and potential skill gaps relative to the job description.

ACTIVE CANDIDATE RESUME:
{resume_text}

TARGET JOB DESCRIPTION:
{job_description}

TASK:
Generate exactly up to {count} highly targeted questions (NO MORE THAN 12 questions total).
Focus strictly on:
1. Deep-dive Project questions probing specific projects, architecture, tradeoffs, and technologies mentioned in the resume.
2. Experience questions testing specific responsibilities, team collaboration, leadership, problem-solving, or scaling from past roles.
3. Skill Gap questions addressing requirements in the Job Description where the candidate's resume shows limited or related experience.

DO NOT generate generic definition or theory questions (e.g., "What is React?"). Those are filled from the standard catalog.
Difficulty must be realistic (Easy, Medium, or Hard).

Return valid JSON conforming to:
{{
  "candidate_type": "FRESHER | EXPERIENCED",
  "questions": [
    {{
      "question": "Clear, specific question text",
      "category": "Project | Experience | Gap",
      "difficulty": "Easy | Medium | Hard",
      "estimated_duration": "3-5 minutes",
      "tech_skill": "Associated technology if applicable, or null"
    }}
  ]
}}
"""
    try:
        parsed: TargetedInterviewResponse = llm_json(
            prompt=prompt,
            response_model=TargetedInterviewResponse,
            feature="personalized_interview_questions",
            temperature=0.2,
        )
    except Exception as exc:
        logger.warning(
            "Failed to generate structured interview questions via llm_json: %s. Returning empty personalized list.",
            exc,
        )
        return {
            "candidate_type": "EXPERIENCED",
            "project": [],
            "experience": [],
            "gap": [],
            "technical": [],
        }

    normalized = {
        "candidate_type": parsed.candidate_type or "EXPERIENCED",
        "project": [],
        "experience": [],
        "gap": [],
        "technical": [],
    }

    for q in parsed.questions[:12]:
        cat_lower = q.category.lower()
        item = {
            "question": q.question.strip(),
            "category": q.category.title(),
            "difficulty": q.difficulty.title() if q.difficulty.title() in ("Easy", "Medium", "Hard") else "Medium",
            "estimated_duration": q.estimated_duration or "3-5 minutes",
            "tech_skill": q.tech_skill.strip() if q.tech_skill else None,
        }
        if "proj" in cat_lower:
            item["category"] = "Project"
            normalized["project"].append(item)
        elif "exp" in cat_lower:
            item["category"] = "Experience"
            normalized["experience"].append(item)
        elif "gap" in cat_lower:
            item["category"] = "Gap"
            normalized["gap"].append(item)
        else:
            item["category"] = "Project"
            normalized["project"].append(item)

    return normalized


DETAILS_SCHEMA = {
    "tip": {"title": "AI Tip", "content": ""},
    "answer": {"sample_answer": ""},
    "key_points": [],
    "common_mistakes": [],
    "follow_up_questions": [],
}


def generate_question_details(
    resume_text: str,
    job_description: str,
    question: str,
):
    from app.services.ai import prompts

    schema_str = json.dumps(DETAILS_SCHEMA, indent=2)
    prompt = prompts.get_question_details_prompt(
        resume_text=resume_text,
        job_description=job_description,
        question=question,
        schema_str=schema_str,
    )
    response = call_llm_with_retry(
        prompt,
        feature="interview_question_details",
        temperature=0.1,
        json_response=True,
    )

    payload = response if isinstance(response, dict) else extract_json(response)

    return {
        "tip": payload.get(
            "tip",
            {
                "title": "AI Tip",
                "content": "",
            },
        ),
        "answer": payload.get(
            "answer",
            {
                "sample_answer": "",
            },
        ),
        "key_points": _to_list(payload.get("key_points", [])),
        "common_mistakes": _to_list(payload.get("common_mistakes", [])),
        "follow_up_questions": _to_list(payload.get("follow_up_questions", [])),
    }


def generate_sample_answer(
    resume_text: str,
    job_description: str,
    question: str,
):
    from app.services.ai import prompts

    prompt = prompts.get_sample_answer_prompt(
        resume_text=resume_text, job_description=job_description, question=question
    )
    response = call_llm_with_retry(
        prompt,
        feature="interview_sample_answer",
        temperature=0.2,
        json_response=True,
    )

    payload = response if isinstance(response, dict) else extract_json(response)

    return {
        "answer": payload.get(
            "answer",
            {
                "sample_answer": "",
            },
        ),
    }
