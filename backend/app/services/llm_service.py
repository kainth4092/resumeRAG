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
    if not isinstance(result, dict):
        result = {}

    # If the root dictionary contains the keys directly instead of under "resume"
    if "resume" not in result:
        if any(
            k in result for k in ["personal_info", "skills", "experience", "projects"]
        ):
            result = {"resume": result}
        else:
            result = {"resume": {}}

    # If "resume" key exists but is not a dict
    if not isinstance(result.get("resume"), dict):
        result["resume"] = {}

    resume_data = result["resume"]

    if "personal_info" not in resume_data or not isinstance(
        resume_data["personal_info"], dict
    ):
        resume_data["personal_info"] = {}

    for field in [
        "name",
        "email",
        "phone",
        "location",
        "linkedin",
        "github",
        "portfolio",
    ]:
        val = resume_data["personal_info"].get(field)
        resume_data["personal_info"][field] = str(val) if val is not None else ""

    # Normalize headline and summary
    resume_data["headline"] = str(resume_data.get("headline") or "")
    resume_data["summary"] = str(resume_data.get("summary") or "")

    # Normalize skills
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

    # Normalize experience
    cleaned_experience = []
    for exp in resume_data["experience"]:
        if not isinstance(exp, dict):
            continue
        cleaned_exp = {}
        for field in ["company", "role", "duration"]:
            val = exp.get(field)
            cleaned_exp[field] = str(val) if val is not None else ""

        if not cleaned_exp["duration"]:
            s_year = exp.get("start_year") or ""
            e_year = exp.get("end_year") or ""
            if s_year or e_year:
                cleaned_exp["duration"] = f"{s_year} - {e_year}"

        desc_list = exp.get("description")
        if not isinstance(desc_list, list):
            desc_list = [str(desc_list)] if desc_list is not None else []
        cleaned_exp["description"] = [
            str(d).strip() for d in desc_list if d is not None and str(d).strip()
        ]
        cleaned_experience.append(cleaned_exp)
    resume_data["experience"] = cleaned_experience

    # Normalize projects
    cleaned_projects = []
    for proj in resume_data["projects"]:
        if not isinstance(proj, dict):
            continue
        cleaned_proj = {}
        for field in ["title", "github", "live"]:
            val = proj.get(field)
            cleaned_proj[field] = str(val) if val is not None else ""

        desc_list = proj.get("description")
        if not isinstance(desc_list, list):
            desc_list = [str(desc_list)] if desc_list is not None else []
        cleaned_proj["description"] = [
            str(d).strip() for d in desc_list if d is not None and str(d).strip()
        ]

        tech_list = proj.get("technologies")
        if not isinstance(tech_list, list):
            tech_list = [str(tech_list)] if tech_list is not None else []
        cleaned_proj["technologies"] = [
            str(t).strip() for t in tech_list if t is not None and str(t).strip()
        ]
        cleaned_projects.append(cleaned_proj)
    resume_data["projects"] = cleaned_projects

    # Normalize education
    cleaned_education = []
    for edu in resume_data["education"]:
        if not isinstance(edu, dict):
            continue
        cleaned_edu = {}
        for field in ["institution", "degree", "start_year", "end_year"]:
            val = edu.get(field)
            cleaned_edu[field] = str(val) if val is not None else ""
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
