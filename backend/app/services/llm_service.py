from openai import OpenAI
from app.core.config import settings
import json
import re
import time
import logging

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url=settings.OPENROUTER_BASE_URL,
)


def call_llm_with_retry(
    prompt: str,
    max_retries: int = 3,
    initial_delay: float = 1.5,
    json_response: bool = False,
):
    delay = initial_delay
    # Primary model from settings, with standard free fallbacks
    models = [
        settings.OPENROUTER_MODEL or "google/gemma-4-31b-it:free",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "qwen/qwen-2-7b-instruct:free",
    ]

    # Remove duplicates but preserve order
    seen = set()
    models = [x for x in models if not (x in seen or seen.add(x))]

    last_err = None
    for model in models:
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert ATS Resume Writer. Always return valid JSON only.",
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.1,
                )
                content = response.choices[0].message.content
                if json_response:
                    # Validate that it is parseable JSON
                    parsed = extract_json(content)
                    return parsed
                return content
            except Exception as e:
                last_err = e
                logger.warning(
                    "LLM request failed for model %s on attempt %d: %s",
                    model,
                    attempt + 1,
                    str(e),
                )
                if attempt == max_retries - 1:
                    break
                time.sleep(delay)
                delay *= 2
        # Reset delay for next model attempt
        delay = initial_delay

    if last_err:
        raise last_err
    raise Exception("All fallback LLM models failed.")


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

    # 2. Normalize headline and summary
    resume_data["headline"] = str(resume_data.get("headline") or "")
    resume_data["summary"] = str(resume_data.get("summary") or "")

    # 3. Normalize skills
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

    # 4. Normalize experience
    cleaned_experience = []
    for exp in resume_data["experience"]:
        if not isinstance(exp, dict):
            continue
        cleaned_exp = {}
        for field in ["company", "role", "duration"]:
            val = exp.get(field)
            cleaned_exp[field] = str(val) if val is not None else ""

        if not cleaned_exp["duration"]:
            # Construct a duration from start_year/end_year if present
            s_year = exp.get("start_year") or ""
            e_year = exp.get("end_year") or ""
            if s_year or e_year:
                cleaned_exp["duration"] = f"{s_year} - {e_year}"

        # Handle description list
        desc_list = exp.get("description")
        if not isinstance(desc_list, list):
            desc_list = [str(desc_list)] if desc_list is not None else []
        cleaned_exp["description"] = [
            str(d).strip() for d in desc_list if d is not None and str(d).strip()
        ]
        cleaned_experience.append(cleaned_exp)
    resume_data["experience"] = cleaned_experience

    # 5. Normalize projects
    cleaned_projects = []
    for proj in resume_data["projects"]:
        if not isinstance(proj, dict):
            continue
        cleaned_proj = {}
        for field in ["title", "github", "live"]:
            val = proj.get(field)
            cleaned_proj[field] = str(val) if val is not None else ""

        # Handle description and technologies
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

    # 6. Normalize education
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


def analyze_resume(resume_text, job_description):
    prompt = f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to compare the candidate's uploaded resume with the Job Description and evaluate how well the resume matches the role.

    #########################
    INPUT
    #########################
    Resume:
    {resume_text}
    ----------------------------------------

    Job Description:
    {job_description}

    #########################
    INSTRUCTIONS
    #########################
    Analyze only the information present in the uploaded resume.
    Never invent:
    - Skills
    - Experience
    - Companies
    - Projects
    - Certifications
    - Education
    Use the Job Description to identify:
    1. Skills already present
    2. Skills missing
    3. ATS weaknesses
    4. Resume strengths
    5. Improvement opportunities

    #########################
    SCORING
    #########################
    ATS Score should consider:
    - Skills Match
    - Experience Relevance
    - Projects
    - Keywords
    - Resume Structure
    - Technical Stack Alignment
    Return a score between 0 and 100.

    #########################
    KEYWORDS
    #########################
    matched_keywords
    - Maximum 10
    - Only keywords actually found in the resume.
    missing_keywords
    - Maximum 10
    - Important keywords from the Job Description that are missing.

    #########################
    SUGGESTIONS
    #########################
    Return EXACTLY 5 suggestions.
    Suggestions must be actionable.
    Examples:
    - Add measurable achievements.
    - Include FastAPI experience.
    - Improve project descriptions.
    - Add missing cloud technologies.
    - Strengthen summary using JD keywords.

    #########################
    HEATMAP
    #########################
    Score every section between 0 and 100.

    #########################
    OUTPUT
    #########################
    Return ONLY valid JSON.
    No markdown.
    No explanation.
    No code block.
    JSON Schema:
    {{
      "ats_score": 0,
      "matched_keywords": [],
      "missing_keywords": [],
      "suggestions": [],
      "heatmap": {{
        "contact_info": 0,
        "summary": 0,
        "skills": 0,
        "experience": 0,
        "projects": 0,
        "education": 0
      }}
    }}
    """

    result = call_llm_with_retry(prompt, json_response=True)
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
    prompt = f"""
    You are an expert ATS Resume Writer and Senior Technical Recruiter.
    Your task is to optimize the uploaded resume according to the Job Description.
    IMPORTANT RULES
    - Never invent companies.
    - Never invent work experience.
    - Never invent degrees.
    - Never invent certifications.
    - Never invent skills.
    - Never invent GitHub or portfolio links.
    - Preserve all factual information.
    - Improve wording only.
    - Improve ATS score.
    - Improve grammar.
    - Improve formatting.
    - Rewrite experience using strong action verbs.
    - Reorder skills according to the Job Description.
    - Improve project descriptions.
    - Improve the professional summary.
    - Keep education truthful.
    - If projects already exist, improve them.
    - If projects do NOT exist, generate at most TWO realistic projects ONLY if enough skills are available.
    - Return ONLY valid JSON.
    - Do NOT return markdown.
    - Do NOT explain anything.
    
    Uploaded Resume
    {resume_text}
    
    ------------------------------------------------
    Job Description
    
    {job_description}
    
    ------------------------------------------------
    ##############################
    STRICT OUTPUT ORDER (MANDATORY)
    ##############################
    The response MUST follow this exact order.
    Do NOT change the order.
    Do NOT skip any section.
    Do NOT rename any key.
    Do NOT move sections.
    The order MUST ALWAYS be:
    1. personal_info
    2. headline
    3. summary
    4. skills
    5. experience
    6. projects
    7. education
    8. certifications
    9. awards
    10. languages
    11. hobbies
    Return ONLY valid JSON.
    Return EXACTLY this schema:

    {json.dumps(OUTPUT_SCHEMA, indent=2)}

    If any section has no information, return an empty array [] or an empty string "".
    Do NOT place Education before Experience.
    Do NOT place Projects before Experience.
    Do NOT move Skills below Projects.
    Do NOT create additional sections.

    Fill EVERY section using the uploaded resume.   
    If a section has no data, return an empty array [] or an empty string "".
    The headline must contain ONLY the professional job title (example: "Frontend Developer", "Backend Developer", "Full Stack Software Engineer").
    Do NOT include technologies in the headline.
    """

    result = call_llm_with_retry(prompt, json_response=True)
    return normalize_generate_response(result)


def generate_general_answer(
    question: str, skill: str, category: str, experience_level: str
) -> str:
    prompt = f"""
    You are a Senior Technical Interviewer.
    Your task is to generate a comprehensive, interview-ready answer for the following question:

    Question: {question}
    Skill/Technology: {skill}
    Category: {category}
    Target Experience Level: {experience_level}

    INSTRUCTIONS:
    - Provide a clear, professional, and technical explanation.
    - Keep the answer concise yet complete (typically 150-250 words).
    - Fully explain any concepts, terms, or technologies involved.
    - Return ONLY the text of the sample answer. Do not wrap in JSON, markdown code blocks, or include any extra commentary.
    """
    try:
        response = call_llm_with_retry(prompt)
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
    prompt = f"""
    You are an expert ATS Resume Analyzer, Technical Recruiter, and Resume Reviewer.
    Your task is to perform a comprehensive health audit of the candidate's resume and generate an ATS health report.
    This analysis does NOT compare against any specific job description, but evaluates overall professional resume quality, ATS-friendliness, structure, and readability.

    #########################
    INPUT
    #########################
    Resume:
    {resume_text}

    #########################
    INSTRUCTIONS
    #########################
    Evaluate the resume structure, wording, formatting, grammar, and completeness.
    Ensure to detect missing sections specifically checking for the presence of:
    - Projects
    - Certifications
    - Achievements
    - Portfolio
    - GitHub
    - LinkedIn
    - Languages
    - Volunteer Experience
    - Publications

    #########################
    OUTPUT SCHEMA
    #########################
    Return ONLY valid JSON with the following structure:
    {{
      "ats_score": 0,               
      "resume_health_score": 0,    
      "formatting_score": 0,    
      "readability_score": 0,    
      "skills_coverage": 0,    
      "experience_quality": 0,    
      "projects_quality": 0,    
      "education_quality": 0,    
      "keyword_optimization": 0,   
      "grammar_writing": 0,        
      "section_completeness": 0,   
      "recruiter_readiness": 0,     
      
      "suggestions": {{
        "quick_fixes": [],          
        "medium_improvements": [],   
        "high_impact_improvements": [] 
      }},
      "missing_sections": [],       
      "strengths": [],              
      "weaknesses": []             
    }}
    """
    return call_llm_with_retry(prompt, json_response=True)


def improve_resume_section(
    resume_text: str, section_name: str, section_content: str = None
) -> str:
    prompt = f"""
    You are an expert ATS Resume Writer and Senior Technical Recruiter.
    Your task is to write a highly optimized, professional, and ATS-friendly version of a specific section in the candidate's resume.
    
    #########################
    INPUT
    #########################
    Full Resume Context:
    {resume_text}
    
    Target Section to Improve:
    {section_name}
    
    Current Section Content (if any):
    {section_content or "Not provided. Please extract/generate from the resume context."}
    
    #########################
    INSTRUCTIONS
    #########################
    - Improve vocabulary, impact, and ATS keywords.
    - Use strong action verbs and professional phrasing.
    - Keep it factual and truthful to the original context. Do not invent new jobs or degrees.
    - If improving summary, write a compelling 3-4 sentence professional summary.
    - If improving experience/projects, write bullet points with measurable impact where possible.
    - Return ONLY the improved plain text of the section. Do not wrap in JSON, markdown code blocks, or include any extra commentary.
    """
    response = call_llm_with_retry(prompt)
    return response.strip()
