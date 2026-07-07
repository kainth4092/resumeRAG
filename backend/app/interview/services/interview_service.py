import json
import re
import time
from app.services.llm_service import client


def call_llm_with_retry(
    prompt: str,
    max_retries: int = 4,
    initial_delay: float = 2,
):
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="google/gemma-4-31b-it:free",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Senior Software Engineering Interviewer at Google. Always return valid JSON only.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.1,
            )
            return response.choices[0].message.content
        except Exception:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
            delay *= 2


def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("LLM did not return valid json")
    text = text[start : end + 1]
    return json.loads(text)


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


def _normalize_interview_payload(payload: dict):
    return {
        "candidate_type": payload.get("candidate_type", "FRESHER"),
        "technical": [
            _normalize_question(q, "technical") for q in payload.get("technical", [])
        ],
        "project": [
            _normalize_question(q, "project") for q in payload.get("project", [])
        ],
        "experience": [
            _normalize_question(q, "experience") for q in payload.get("experience", [])
        ],
    }


INTERVIEW_SCHEMA = {
    "candidate_type": "FRESHER | EXPERIENCED",
    "technical": [
        {
            "question": "",
            "category": "Technical",
            "difficulty": "Easy",
            "estimated_duration": "2-3 minutes",
            "tech_skill": "Name of the technology/skill (e.g., Python, Docker, PostgreSQL, React, Git, etc.)",
        }
    ],
    "project": [
        {
            "question": "",
            "category": "Project",
            "difficulty": "Medium",
            "estimated_duration": "3-5 minutes",
        }
    ],
    "experience": [
        {
            "question": "",
            "category": "Experience",
            "difficulty": "Hard",
            "estimated_duration": "5-7 minutes",
        }
    ],
}


def generate_interview_questions(
    resume_text: str,
    job_description: str,
    target_count: int = 40,
):
    from app.services.ai import prompts

    fresher_tech = int(target_count * 0.625)
    fresher_proj = target_count - fresher_tech

    exp_tech = int(target_count * 0.5)
    exp_exp = int(target_count * 0.25)
    exp_proj = target_count - exp_tech - exp_exp

    schema_str = json.dumps(INTERVIEW_SCHEMA, indent=2)
    prompt = prompts.get_interview_questions_prompt(
        resume_text=resume_text,
        job_description=job_description,
        target_count=target_count,
        fresher_tech=fresher_tech,
        fresher_proj=fresher_proj,
        exp_tech=exp_tech,
        exp_exp=exp_exp,
        exp_proj=exp_proj,
        schema_str=schema_str,
    )

    response = call_llm_with_retry(prompt)
    payload = extract_json(response)
    return _normalize_interview_payload(payload)


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
    response = call_llm_with_retry(prompt)
    payload = extract_json(response)

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
    response = call_llm_with_retry(prompt)
    payload = extract_json(response)

    return {
        "answer": payload.get(
            "answer",
            {
                "sample_answer": "",
            },
        ),
    }
