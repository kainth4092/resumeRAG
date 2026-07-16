import json
import re
import logging
from app.services.ai import get_ai_provider, prompts

logger = logging.getLogger(__name__)


def extract_json(content: str) -> dict:
    """
    Safely extract a JSON object from an LLM response.

    Handles:
    - Pure JSON
    - ```json code blocks
    - ``` code blocks
    - Extra text surrounding a JSON object

    Raises ValueError when no valid JSON object can be extracted.
    """

    if not content or not isinstance(content, str):
        raise ValueError("AI returned an empty or invalid response.")

    cleaned = content.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    cleaned = cleaned.strip()

    try:
        result = json.loads(cleaned)

        if not isinstance(result, dict):
            raise ValueError("AI response must be a JSON object.")

        return result

    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1 or end <= start:
        logger.error(
            "No JSON object found in AI response. response_length=%s",
            len(cleaned),
        )

        raise ValueError("The AI returned an invalid response format.")

    json_candidate = cleaned[start : end + 1]

    try:
        result = json.loads(json_candidate)

        if not isinstance(result, dict):
            raise ValueError("AI response must be a JSON object.")

        return result

    except json.JSONDecodeError as exc:
        logger.error(
            "Failed to parse AI JSON response. " "response_length=%s error=%s",
            len(cleaned),
            exc,
        )

        raise ValueError("The AI returned malformed JSON.") from exc


class ChatCompletionsAdapter:
    def create(
        self,
        model: str = None,
        messages: list = None,
        temperature: float = 0.1,
        timeout: float = None,
        feature: str = "legacy_adapter",
    ):
        if messages is None:
            messages = []

        system_content = "You are an expert assistant."
        user_content = ""

        for msg in messages:
            if msg.get("role") == "system":
                system_content = msg.get("content", "")
            elif msg.get("role") == "user":
                user_content = msg.get("content", "")

        provider = get_ai_provider()

        content = provider.chat(
            system_prompt=system_content,
            user_prompt=user_content,
            temperature=temperature,
            timeout=timeout,
            feature=feature,
        )

        class MessageObj:
            def __init__(self, content_str):
                self.content = content_str

        class ChoiceObj:
            def __init__(self, content_str):
                self.message = MessageObj(content_str)

        class ResponseObj:
            def __init__(self, content_str):
                self.choices = [ChoiceObj(content_str)]

        return ResponseObj(content)


class ChatAdapter:
    completions = ChatCompletionsAdapter()


class OpenAIClientAdapter:
    chat = ChatAdapter()


# Expose 'client' as an instance of the adapter to maintain backward compatibility
client = OpenAIClientAdapter()


def call_llm_with_retry(
    prompt: str,
    *,
    feature: str,
    temperature: float = 0.0,
    json_response: bool = False,
    timeout: float = None,
):
    """
    Call the active AI provider exactly once.

    IMPORTANT:
    This function intentionally performs no automatic retries.
    One application action should result in at most one LLM request.
    """

    system_prompt = (
        "You are an expert ATS Resume Writer. "
        "Follow the user's instructions exactly. "
        "When JSON is requested, return valid JSON only with no markdown."
    )

    provider = get_ai_provider()

    logger.info(
        "[LLM_SERVICE_CALL] feature=%s prompt_size=%s json_response=%s",
        feature,
        len(prompt),
        json_response,
    )

    try:
        content = provider.chat(
            system_prompt=system_prompt,
            user_prompt=prompt,
            temperature=temperature,
            timeout=timeout,
            feature=feature,
        )

        if json_response:
            logger.warning(
                "[LLM_RAW_JSON_RESPONSE] feature=%s content=%r",
                feature,
                content[:3000],
            )
            return extract_json(content)

        return content

    except Exception:
        logger.exception(
            "[LLM_SERVICE_FAILED] feature=%s",
            feature,
        )
        raise


def normalize_generate_response(result: dict) -> dict:
    """
    Normalize the LLM-generated resume response to the canonical frontend schema.

    Bridges schema aliases:
    - contact/personal → personal_info
    - bullets → description/bullets
    - github_url → github, live_url → live
    - start_date/startYear → start_year, end_date/endYear → end_year
    - institution aliases (school, university, college)
    - title → headline
    """
    if not isinstance(result, dict):
        result = {}

    # If the root dictionary contains the keys directly instead of under "resume"
    if "resume" not in result:
        if any(
            k in result
            for k in [
                "personal_info",
                "contact",
                "skills",
                "experience",
                "projects",
            ]
        ):
            result = {"resume": result}
        else:
            result = {"resume": {}}

    # If "resume" key exists but is not a dict
    if not isinstance(result.get("resume"), dict):
        result["resume"] = {}

    resume_data = result["resume"]

    # --- Bridge contact → personal_info ---
    raw_pi = {}
    for pi_key in ["personal_info", "contact", "personal"]:
        if pi_key in resume_data and isinstance(resume_data[pi_key], dict):
            raw_pi = resume_data[pi_key]
            break

    resume_data["personal_info"] = {
        "name": str(
            raw_pi.get("name")
            or raw_pi.get("full_name")
            or raw_pi.get("fullName")
            or resume_data.get("name")
            or ""
        ),
        "email": str(raw_pi.get("email") or resume_data.get("email") or ""),
        "phone": str(
            raw_pi.get("phone")
            or raw_pi.get("phone_number")
            or resume_data.get("phone")
            or ""
        ),
        "location": str(
            raw_pi.get("location")
            or raw_pi.get("city")
            or raw_pi.get("address")
            or resume_data.get("location")
            or ""
        ),
        "linkedin": str(
            raw_pi.get("linkedin")
            or raw_pi.get("linkedin_url")
            or resume_data.get("linkedin_url")
            or ""
        ),
        "github": str(
            raw_pi.get("github")
            or raw_pi.get("github_url")
            or resume_data.get("github_url")
            or ""
        ),
        "portfolio": str(
            raw_pi.get("portfolio")
            or raw_pi.get("portfolio_url")
            or raw_pi.get("website")
            or raw_pi.get("website_url")
            or resume_data.get("portfolio_url")
            or ""
        ),
    }

    # Remove the original keys if they were the source to avoid confusion
    for cleanup_key in ["contact", "personal"]:
        resume_data.pop(cleanup_key, None)

    # --- Normalize headline and summary ---
    resume_data["headline"] = str(
        resume_data.get("headline")
        or resume_data.get("title")
        or raw_pi.get("title")
        or ""
    )
    raw_summary = resume_data.get("summary") or ""
    if isinstance(raw_summary, dict):
        raw_summary = raw_summary.get("text") or raw_summary.get("summary") or ""
    resume_data["summary"] = str(raw_summary)

    # --- Normalize skills ---
    if "skills" not in resume_data or not isinstance(resume_data["skills"], list):
        resume_data["skills"] = []
    else:
        cleaned_skills = []
        for s in resume_data["skills"]:
            if isinstance(s, dict):
                skill_name = s.get("name") or s.get("skill") or ""
                cleaned_skills.append(str(skill_name))
            elif s is not None:
                cleaned_skills.append(str(s))
        resume_data["skills"] = [s.strip() for s in cleaned_skills if s.strip()]

    for list_field in [
        "experience",
        "projects",
        "education",
        "certifications",
        "awards",
        "languages",
        "hobbies",
    ]:
        if list_field not in resume_data or not isinstance(
            resume_data[list_field], list
        ):
            resume_data[list_field] = []

    # --- Normalize experience ---
    cleaned_experience = []
    for exp in resume_data["experience"]:
        if not isinstance(exp, dict):
            continue
        cleaned_exp = {}
        cleaned_exp["company"] = str(
            exp.get("company") or exp.get("company_name") or exp.get("employer") or ""
        )
        cleaned_exp["role"] = str(
            exp.get("role") or exp.get("title") or exp.get("job_title") or ""
        )
        cleaned_exp["location"] = str(exp.get("location") or "")
        cleaned_exp["currently_working"] = bool(
            exp.get("currently_working") or exp.get("current") or False
        )

        # Duration
        duration = str(exp.get("duration") or "")
        if not duration:
            s_date = str(exp.get("start_date") or exp.get("start_year") or "")
            e_date = str(exp.get("end_date") or exp.get("end_year") or "")
            if not e_date and cleaned_exp["currently_working"]:
                e_date = "Present"
            if s_date or e_date:
                duration = f"{s_date} - {e_date}"
        cleaned_exp["duration"] = duration

        # Start/End year
        cleaned_exp["start_year"] = str(
            exp.get("start_year") or exp.get("start_date") or exp.get("startYear") or ""
        )
        cleaned_exp["end_year"] = str(
            exp.get("end_year") or exp.get("end_date") or exp.get("endYear") or ""
        )
        if not cleaned_exp["end_year"] and cleaned_exp["currently_working"]:
            cleaned_exp["end_year"] = "Present"

        # Description / bullets
        desc_list = exp.get("description") or exp.get("bullets") or []
        if not isinstance(desc_list, list):
            if isinstance(desc_list, str) and desc_list.strip():
                desc_list = [
                    line.strip() for line in desc_list.split("\n") if line.strip()
                ]
            else:
                desc_list = [str(desc_list)] if desc_list else []
        cleaned_exp["description"] = [
            str(d).strip() for d in desc_list if d is not None and str(d).strip()
        ]
        cleaned_exp["bullets"] = cleaned_exp["description"]

        cleaned_experience.append(cleaned_exp)
    resume_data["experience"] = cleaned_experience

    # --- Normalize projects ---
    cleaned_projects = []
    for proj in resume_data["projects"]:
        if not isinstance(proj, dict):
            continue
        cleaned_proj = {}
        cleaned_proj["title"] = str(proj.get("title") or proj.get("name") or "")
        cleaned_proj["github"] = str(proj.get("github") or proj.get("github_url") or "")
        cleaned_proj["live"] = str(
            proj.get("live") or proj.get("live_url") or proj.get("url") or ""
        )

        desc_list = proj.get("description") or proj.get("desc") or []
        if isinstance(desc_list, str):
            desc_list = [line.strip() for line in desc_list.split("\n") if line.strip()]
        elif not isinstance(desc_list, list):
            desc_list = [str(desc_list)] if desc_list else []
        cleaned_proj["description"] = [
            str(d).strip() for d in desc_list if d is not None and str(d).strip()
        ]

        tech_list = (
            proj.get("technologies") or proj.get("tech") or proj.get("tech_stack") or []
        )
        if isinstance(tech_list, str):
            tech_list = [t.strip() for t in tech_list.split(",") if t.strip()]
        elif not isinstance(tech_list, list):
            tech_list = [str(tech_list)] if tech_list else []
        cleaned_proj["technologies"] = [
            str(t).strip() for t in tech_list if t is not None and str(t).strip()
        ]
        cleaned_projects.append(cleaned_proj)
    resume_data["projects"] = cleaned_projects

    # --- Normalize education ---
    cleaned_education = []
    for edu in resume_data["education"]:
        if not isinstance(edu, dict):
            continue
        cleaned_edu = {}
        cleaned_edu["institution"] = str(
            edu.get("institution")
            or edu.get("school")
            or edu.get("university")
            or edu.get("college")
            or ""
        )
        cleaned_edu["degree"] = str(
            edu.get("degree") or edu.get("qualification") or edu.get("major") or ""
        )
        cleaned_edu["start_year"] = str(
            edu.get("start_year") or edu.get("start_date") or edu.get("startYear") or ""
        )
        cleaned_edu["end_year"] = str(
            edu.get("end_year") or edu.get("end_date") or edu.get("endYear") or ""
        )
        cleaned_education.append(cleaned_edu)
    resume_data["education"] = cleaned_education

    return result


def normalize_health_response(result: dict) -> dict:
    if not isinstance(result, dict):
        result = {}

    score_fields = [
        "ats_score",
        "resume_health_score",
        "formatting_score",
        "readability_score",
        "skills_coverage",
        "experience_quality",
        "projects_quality",
        "education_quality",
        "keyword_optimization",
        "grammar_writing",
        "section_completeness",
        "recruiter_readiness",
    ]
    for field in score_fields:
        if field not in result:
            result[field] = 70
        else:
            try:
                result[field] = int(result[field])
            except (ValueError, TypeError):
                result[field] = 70

    if "summary" not in result:
        result["summary"] = ""
    else:
        result["summary"] = str(result["summary"])

    if "formatting_status" not in result:
        result["formatting_status"] = "Standard Passed"
    else:
        result["formatting_status"] = str(result["formatting_status"])

    if "grammar_status" not in result:
        result["grammar_status"] = "Clean"
    else:
        result["grammar_status"] = str(result["grammar_status"])

    if "suggestions" not in result or not isinstance(result["suggestions"], dict):
        result["suggestions"] = {}

    sug = result["suggestions"]
    for list_field in [
        "quick_fixes",
        "medium_improvements",
        "high_impact_improvements",
    ]:
        if list_field not in sug or not isinstance(sug[list_field], list):
            sug[list_field] = []
        else:
            sug[list_field] = [str(x) for x in sug[list_field] if x is not None]

    for list_field in ["missing_sections", "strengths", "weaknesses"]:
        if list_field not in result or not isinstance(result[list_field], list):
            result[list_field] = []
        else:
            result[list_field] = [str(x) for x in result[list_field] if x is not None]

    return result


def analyze_resume(resume_text: str, job_description: str):
    prompt_str = prompts.get_ats_prompt(
        resume_text,
        job_description,
    )

    result = call_llm_with_retry(
        prompt_str,
        feature="ats_analysis",
        temperature=0.0,
        json_response=True,
    )

    return normalize_analyze_response(result)


def generate_general_answer(
    question: str,
    skill: str,
    category: str,
    experience_level: str,
) -> str:
    prompt_str = prompts.get_general_answer_prompt(
        question,
        skill,
        category,
        experience_level,
    )

    try:
        response = call_llm_with_retry(
            prompt_str,
            feature="interview_general_answer",
            temperature=0.2,
        )

        response = response.strip()

        if response.startswith("```"):
            lines = response.splitlines()

            if len(lines) >= 2:
                response = "\n".join(lines[1:-1])

        return response.strip()

    except Exception:
        logger.exception(
            "Failed to generate AI answer. " "skill=%s category=%s experience_level=%s",
            skill,
            category,
            experience_level,
        )

        return f"AI generated sample answer for: {question}"


OUTPUT_SCHEMA = {
    "resume": {
        "personal_info": {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
        },
        "headline": "",
        "summary": "",
        "skills": [],
        "experience": [
            {
                "company": "",
                "role": "",
                "start_month": "",
                "start_year": "",
                "end_month": "",
                "end_year": "",
                "currently_working": False,
                "description": [],
            }
        ],
        "projects": [
            {
                "title": "",
                "technologies": [],
                "description": [],
                "github": "",
                "live": "",
            }
        ],
        "education": [
            {"institution": "", "degree": "", "start_year": "", "end_year": ""}
        ],
        "certifications": [],
        "awards": [],
        "languages": [],
        "hobbies": [],
    }
}


def generate_interview_bank_questions(
    skill: str,
    experience_level: str,
    count: int = 8,
) -> list[dict]:
    """
    Generate interview questions for a skill.

    Returns:
        [
            {
                "question": "...",
                "category": "...",
                "difficulty": "..."
            }
        ]
    """

    prompt_str = prompts.get_interview_bank_generation_prompt(
        skill=skill,
        experience_level=experience_level,
        count=count,
    )

    try:

        response = call_llm_with_retry(
            prompt_str,
            feature="interview_bank_generation",
            temperature=0.3,
        )

        response = response.strip()

        if response.startswith("```"):
            lines = response.splitlines()
            response = "\n".join(lines[1:-1]).strip()

        questions = json.loads(response)

        if not isinstance(
            questions,
            list,
        ):
            raise ValueError("Expected JSON list.")

        cleaned = []

        seen = set()

        for item in questions:

            if not isinstance(
                item,
                dict,
            ):
                continue

            question = str(
                item.get(
                    "question",
                    "",
                )
            ).strip()

            if len(question) < 10:
                continue

            key = question.lower()

            if key in seen:
                continue

            seen.add(key)

            cleaned.append(
                {
                    "question": question,
                    "category": str(
                        item.get(
                            "category",
                            "Technical",
                        )
                    ).strip(),
                    "difficulty": str(
                        item.get(
                            "difficulty",
                            "Medium",
                        )
                    ).strip(),
                }
            )

        return cleaned

    except Exception:

        logger.exception(
            "Interview bank generation failed " "for %s",
            skill,
        )

        return []


def generate_resume(resume_text: str, job_description: str):
    schema_str = json.dumps(OUTPUT_SCHEMA)
    prompt_str = prompts.get_resume_prompt(resume_text, job_description, schema_str)
    result = call_llm_with_retry(
        prompt_str,
        feature="resume_generation",
        temperature=0.0,
        json_response=True,
    )
    return normalize_generate_response(result)


def analyze_resume_health(resume_text: str):
    prompt_str = prompts.get_resume_health_prompt(resume_text)

    result = call_llm_with_retry(
        prompt_str,
        feature="resume_health_analysis",
        temperature=0.0,
        json_response=True,
    )

    return normalize_health_response(result)


def improve_resume_section(
    resume_text: str,
    section_name: str,
    section_content: str = None,
) -> str:
    prompt_str = prompts.get_improve_section_prompt(
        resume_text,
        section_name,
        section_content,
    )

    response = call_llm_with_retry(
        prompt_str,
        feature="resume_section_improvement",
        temperature=0.2,
    )

    return response.strip()
