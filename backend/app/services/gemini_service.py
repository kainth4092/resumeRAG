from google import genai
from app.core.config import settings
import json
import re
import time
import random
import sys

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def call_gemini_with_retry(
    model: str, contents: str, max_retries: int = 4, initial_delay: float = 2.0
):
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )
            return response
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            print(
                f"Gemini API call attempt {attempt+1} failed: {str(e)}. Retrying in {delay}s...",
                file=sys.stderr,
            )
            time.sleep(delay + random.uniform(0.1, 0.5))
            delay *= 2


def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"^```", "", text)
    text = re.sub(r"```$", "", text)

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("Gemini did not return valid json")
    text = text[start : end + 1]
    return json.loads(text)


def analyze_resume(resume_text, job_description):
    prompt = f"""
    You are an expert ATS Resume Analyzer specializing in Software Engineering and IT resumes.
    Your task is to compare the candidate's resume with the provided Job Description.
    Analyze only for Software/IT related roles such as:
    - Software Engineer
    - Frontend Developer
    - Backend Developer
    - Full Stack Developer
    - Python Developer
    - Java Developer
    - DevOps Engineer
    - AI/ML Engineer
    - Data Engineer
    - QA Engineer
    - Cloud Engineer
    Resume:
    {resume_text}
    ------------------------------------
    Job Description:
    {job_description}
    ------------------------------------
    Return ONLY valid JSON.
    Do not return markdown.
    Do not return explanation.
    Do not wrap JSON inside ```.
    JSON format:
    {{
        "ats_score": 0,
        "matched_keywords": [],
        "missing_keywords": [],
        "suggestions": [],
        "heatmap": {{
            "contact_info":0,
            "summary":0,
            "skills":0,
            "experience":0,
            "projects":0,
            "education":0
        }}
    }}
    Rules:
    1. ATS Score must be between 0 and 100.
    2. Return maximum 10 matched keywords.
    3. Return maximum 10 missing keywords.
    4. Return exactly 5 AI suggestions.
    5. Heatmap values should be between 0 and 100.
    6. Suggestions should improve ATS score.
    7. Keywords should be extracted from Job Description.
    8. Response must always be valid JSON.
    9. Never invent any skills, experience, certifications or projects.
    10. Only use information available in the uploaded resume.
    11. If a required skill is missing, list it under missing_keywords.
    12. Return ONLY JSON.
    """

    response = call_gemini_with_retry(model="gemini-3.5-flash", contents=prompt)
    return extract_json(response.text)


def generate_resume(resume_text, job_description):
    prompt = (
        prompt
    ) = f"""
    You are an expert ATS Resume Writer specializing in Software Engineering and IT resumes.
    Your task is to rewrite and optimize the uploaded resume according to the provided Job Description.
    IMPORTANT RULES
    1. Never invent fake experience.
    2. Never invent fake projects.
    3. Never invent certifications.
    4. Never invent skills.
    5. Only improve wording, formatting and ATS optimization.
    6. Preserve factual information.
    7. Improve bullet points using strong action verbs.
    8. Improve professional summary.
    9. Reorder skills according to job relevance.
    10. Optimize the resume for ATS.
    11. Make the resume concise and professional.
    12. Return ONLY valid JSON.
    13. Never wrap JSON inside markdown.
    ------------------------------------
    Uploaded Resume
    {resume_text}
    ------------------------------------
    Job Description
    {job_description}
    ------------------------------------
    Return JSON in exactly this format:
    {{
      "resume": {{
        "personal_info": {{
          "name": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "github": ""
        }},
        "headline": "",
        "summary": "",
        "skills": [],
        "experience": [
          {{
            "company": "",
            "role": "",
            "duration": "",
            "description": []
          }}
        ],
        "projects": [
          {{
            "title": "",
            "technologies": [],
            "description": [],
            "github": "",
            "live": ""
          }}
        ],
        "education": [
          {{
            "institution": "",
            "degree": "",
            "start_year": "",
            "end_year": ""
          }}
        ]
      }}
    }}
    """

    response = call_gemini_with_retry(
        model="gemini-3.5-flash",
        contents=prompt,
    )
    return extract_json(response.text)
