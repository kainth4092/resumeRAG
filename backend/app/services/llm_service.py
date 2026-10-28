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


def llm_text(
    prompt: str,
    *,
    feature: str = "general_text",
    system_prompt: str | None = None,
    temperature: float = 0.2,
    timeout: float | None = None,
) -> str:
    """
    Plain-text LLM completion without JSON parsing or formatting enforcement.
    """
    sys_prompt = system_prompt or (
        "You are an expert career and ATS resume assistant. "
        "Follow the user's instructions directly and produce clear, concise text."
    )
    provider = get_ai_provider()
    logger.info("[LLM_TEXT_CALL] feature=%s prompt_size=%d", feature, len(prompt))
    return provider.chat(
        system_prompt=sys_prompt,
        user_prompt=prompt,
        temperature=temperature,
        timeout=timeout,
        feature=feature,
        json_mode=False,
    ).strip()


def llm_json(
    prompt: str,
    response_model=None,
    *,
    feature: str = "general_json",
    system_prompt: str | None = None,
    temperature: float = 0.0,
    timeout: float | None = None,
):
    """
    Structured JSON LLM completion.
    Passes json_mode=True to the provider, extracts JSON from response, validates
    against response_model if provided, retries ONCE with a repair prompt on failure,
    and raises typed LLMValidationError.
    """
    from app.services.ai.base import LLMValidationError

    sys_prompt = system_prompt or (
        "You are an expert ATS resume writer and career coach. "
        "Return valid JSON only matching the requested structure. "
        "Do not include markdown code block syntax (like ```json) or explanatory commentary."
    )
    provider = get_ai_provider()
    logger.info(
        "[LLM_JSON_CALL] feature=%s prompt_size=%d model=%s",
        feature,
        len(prompt),
        getattr(response_model, "__name__", None),
    )

    def _parse_and_validate(text: str):
        data = extract_json(text)
        if response_model is not None:
            if hasattr(response_model, "model_validate"):
                return response_model.model_validate(data)
            elif hasattr(response_model, "parse_obj"):
                return response_model.parse_obj(data)
        return data

    try:
        raw = provider.chat(
            system_prompt=sys_prompt,
            user_prompt=prompt,
            temperature=temperature,
            timeout=timeout,
            feature=feature,
            json_mode=True,
        )
        return _parse_and_validate(raw)
    except Exception as first_err:
        logger.warning(
            "[LLM_JSON_REPAIR] feature=%s first attempt failed: %s. Retrying with repair prompt.",
            feature,
            first_err,
        )
        repair_prompt = (
            f"Your previous response was invalid JSON or failed schema validation.\n"
            f"Validation error: {first_err}\n\n"
            f"Original prompt:\n{prompt}\n\n"
            f"Please output strictly valid JSON conforming to the original schema."
        )
        try:
            repaired_raw = provider.chat(
                system_prompt=sys_prompt,
                user_prompt=repair_prompt,
                temperature=0.0,
                timeout=timeout,
                feature=feature,
                json_mode=True,
            )
            return _parse_and_validate(repaired_raw)
        except Exception as second_err:
            logger.error(
                "[LLM_JSON_FAILED] feature=%s repair failed: %s",
                feature,
                second_err,
            )
            raise LLMValidationError(
                f"Failed to generate valid structured data for {feature}: {second_err}"
            ) from second_err


def call_llm_with_retry(
    prompt: str,
    *,
    feature: str,
    temperature: float = 0.0,
    json_response: bool = False,
    timeout: float = None,
):
    """
    Compatibility wrapper delegating to llm_json or llm_text.
    """
    if json_response:
        return llm_json(
            prompt,
            feature=feature,
            temperature=temperature,
            timeout=timeout,
        )
    return llm_text(
        prompt,
        feature=feature,
        temperature=temperature,
        timeout=timeout,
    )


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
        seen = set()
        deduped = []
        for skill in cleaned_skills:
            normalized = skill.strip()
            if not normalized:
                continue
            key = normalized.lower()
            if key in seen:
                continue
            seen.add(key)
            deduped.append(normalized)
        resume_data["skills"] = deduped

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
        if not (
            cleaned_exp["company"] or cleaned_exp["role"] or cleaned_exp["description"]
        ):
            continue

        cleaned_experience.append(cleaned_exp)
    resume_data["experience"] = cleaned_experience

    # --- Normalize projects ---
    # --- Normalize projects ---
    cleaned_projects = []
    for proj in resume_data.get("projects", []):
        if not isinstance(proj, dict):
            continue
        cleaned_proj = {}
        cleaned_proj["title"] = str(proj.get("title") or proj.get("name") or "")
        cleaned_proj["github"] = str(proj.get("github") or proj.get("github_url") or "")
        cleaned_proj["live"] = str(
            proj.get("live") or proj.get("live_url") or proj.get("url") or ""
        )
        # ---------------- Description ---------------- #
        description = proj.get("description") or proj.get("desc") or []
        if isinstance(description, str):
            description = [x.strip() for x in description.split("\n") if x.strip()]
        elif not isinstance(description, list):
            description = [str(description)] if description else []
        cleaned_proj["description"] = [
            str(x).strip() for x in description if str(x).strip()
        ]

        # ---------------- Technologies ---------------- #
        technologies = (
            proj.get("technologies") or proj.get("tech") or proj.get("tech_stack") or []
        )
        if isinstance(technologies, str):
            technologies = re.split(
                r"[,|;/•·]",
                technologies,
            )
        elif not isinstance(technologies, list):
            technologies = [str(technologies)] if technologies else []
        seen = set()
        cleaned_tech = []
        for tech in technologies:
            tech = str(tech).strip()
            if not tech:
                continue
            key = tech.lower()
            if key in seen:
                continue
            seen.add(key)
            cleaned_tech.append(tech)
        cleaned_proj["technologies"] = cleaned_tech
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


def normalize_analyze_response(result: dict) -> dict:
    if not isinstance(result, dict):
        result = {}

    if "ats_score" not in result:
        result["ats_score"] = 70
    else:
        try:
            result["ats_score"] = int(result["ats_score"])
        except (ValueError, TypeError):
            result["ats_score"] = 70

    for list_field in ["matched_keywords", "missing_keywords", "suggestions"]:
        if list_field not in result or not isinstance(result[list_field], list):
            result[list_field] = []

    if "heatmap" not in result or not isinstance(result["heatmap"], dict):
        result["heatmap"] = {}

    heatmap = result["heatmap"]
    for field in [
        "contact_info",
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
    ]:
        if field not in heatmap:
            heatmap[field] = 70
        else:
            try:
                heatmap[field] = int(heatmap[field])
            except (ValueError, TypeError):
                heatmap[field] = 70

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
) -> str | None:
    prompt_str = prompts.get_general_answer_prompt(
        question,
        skill,
        category,
        experience_level,
    )

    try:
        response = llm_text(
            prompt_str,
            feature="interview_general_answer",
            temperature=0.2,
        )

        response = response.strip()

        if response.startswith("```"):
            lines = response.splitlines()

            if len(lines) >= 2:
                response = "\n".join(lines[1:-1])

        clean_resp = response.strip()
        return clean_resp if clean_resp else None

    except Exception:
        logger.exception(
            "Failed to generate AI answer. skill=%s category=%s experience_level=%s",
            skill,
            category,
            experience_level,
        )
        return None


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


def generate_resume(
    resume_text: str,
    job_description: str,
    improvement_feedback: str | None = None,
):
    schema_str = json.dumps(OUTPUT_SCHEMA)
    prompt_str = prompts.get_resume_prompt(
        resume_text,
        job_description,
        schema_str,
        improvement_feedback=improvement_feedback,
    )
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

    response = llm_text(
        prompt_str,
        feature="resume_section_improvement",
        temperature=0.2,
    )

    return response.strip()
