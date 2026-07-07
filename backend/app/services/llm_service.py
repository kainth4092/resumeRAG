import json
import re
import logging
from app.services.ai import get_ai_provider, prompts

logger = logging.getLogger(__name__)

# Adapts the OpenAI client.chat.completions.create signature to the active AIProvider
class ChatCompletionsAdapter:
    def create(self, model: str = None, messages: list = [], temperature: float = 0.1, timeout: float = None):
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
            timeout=timeout
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
    max_retries: int = 3,
    initial_delay: float = 1.5,
    json_response: bool = False,
):
    """
    Call active AI LLM provider.
    """
    system_prompt = "You are an expert ATS Resume Writer. Always return valid JSON only."
    provider = get_ai_provider()
    
    try:
        content = provider.chat(
            system_prompt=system_prompt,
            user_prompt=prompt,
            temperature=0.1
        )
        if json_response:
            return extract_json(content)
        return content
    except Exception as e:
        logger.error("LLM call failed in call_llm_with_retry: %s", str(e))
        raise e


def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("LLM did not return valid JSON")
    text = text[start : end + 1]
    return json.loads(text)


def normalize_analyze_response(result: dict) -> dict:
    if not isinstance(result, dict):
        result = {}

    # Ensure key fields
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

    if "suggestions" not in result or not isinstance(result["suggestions"], dict):
        result["suggestions"] = {}

    sug = result["suggestions"]
    for list_field in ["quick_fixes", "medium_improvements", "high_impact_improvements"]:
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


def analyze_resume(resume_text, job_description):
    prompt_str = prompts.get_ats_prompt(resume_text, job_description)
    result = call_llm_with_retry(prompt_str, json_response=True)
    return normalize_analyze_response(result)


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


def generate_resume(resume_text, job_description):
    schema_str = json.dumps(OUTPUT_SCHEMA)
    prompt_str = prompts.get_resume_prompt(resume_text, job_description, schema_str)
    result = call_llm_with_retry(prompt_str, json_response=True)
    return normalize_generate_response(result)


def generate_general_answer(
    question: str, skill: str, category: str, experience_level: str
) -> str:
    prompt_str = prompts.get_general_answer_prompt(question, skill, category, experience_level)
    try:
        response = call_llm_with_retry(prompt_str)
        response = response.strip()
        if response.startswith("```"):
            lines = response.splitlines()
            if len(lines) >= 2:
                response = "\n".join(lines[1:-1])
        return response.strip()
    except Exception as e:
        logger.error("Failed to generate AI answer: %s", e, exc_info=True)
        return f"AI generated sample answer for: {question}"


def analyze_resume_health(resume_text: str):
    prompt_str = prompts.get_resume_health_prompt(resume_text)
    result = call_llm_with_retry(prompt_str, json_response=True)
    return normalize_health_response(result)


def improve_resume_section(
    resume_text: str, section_name: str, section_content: str = None
) -> str:
    prompt_str = prompts.get_improve_section_prompt(resume_text, section_name, section_content)
    response = call_llm_with_retry(prompt_str)
    return response.strip()
