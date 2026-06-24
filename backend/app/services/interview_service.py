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
        except Exception as e:
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
):
    prompt = f"""
    You are a Senior Software Engineering Interviewer at Google, Microsoft, Amazon and Atlassian.
    Your task is to generate highly personalized interview questions based on BOTH the candidate's Resume and the target Job Description.

    ## Candidate Resume
    {resume_text}

    ## Job Description
    {job_description}
    ---

    STEP 1 - Candidate Analysis
    Analyze the resume.
    Determine whether the candidate is:

    * FRESHER
    * EXPERIENCED

    Treat only full-time professional work as experience.
    Internships, freelance work, college projects and personal projects do NOT count as professional experience.

    ---
    STEP 2 - Skill Extraction
    Extract all technical skills from the Resume.
    Extract all technical skills from the Job Description.
    Find all matching skills.
    Examples

    Resume

    React
    Python
    FastAPI
    PostgreSQL
    Docker
    Git

    JD

    React
    Python
    Docker
    AWS
    Git

    Matched Skills
    React
    Python
    Docker
    Git

    If very few matching skills exist, use remaining Resume skills.
    Never generate questions for technologies that do not exist in the Resume.
    ---
    QUESTION DISTRIBUTION

    For FRESHER
    Generate EXACTLY
    25 Technical Questions
    15 Project Questions
    Total = 40 Questions

    For EXPERIENCED
    Generate EXACTLY
    20 Technical Questions
    10 Experience Questions
    10 Project Questions
    Total = 40 Questions

    ---

    TECHNICAL QUESTION STRATEGY
    Generate questions evenly across ALL matched skills.
    Never focus on only one technology (e.g. React). You MUST generate questions for a variety of matched skills (e.g. Python, FastAPI, PostgreSQL, Docker, Git, etc.).
    Every matched skill must have at least TWO interview questions.
    For each technical question, you MUST populate the 'tech_skill' field with the exact name of the technology or skill the question is testing (e.g., "React", "Python", "FastAPI", "PostgreSQL", "Docker", "Git", etc.).
    Question progression

    Level 1
    Definition

    Example
    What is React?
    What is Python?
    What is FastAPI?
    What is Docker?
    What is PostgreSQL?

    Level 2

    Concepts
    React Hooks
    State vs Props
    OOP
    REST API
    SQL Joins
    Normalization
    Dependency Injection
    JWT Authentication

    Level 3

    Practical
    How would you optimize React?
    How does FastAPI validate requests?
    Explain JWT implementation.
    Explain PostgreSQL indexing.

    Level 4

    Scenario Based
    How would you improve application performance?
    How would you secure a REST API?
    How would you design database relationships?
    Distribute questions evenly.

    Example

    React → 5 Questions
    Python → 5 Questions
    FastAPI → 5 Questions
    PostgreSQL → 5 Questions
    Docker → 5 Questions
    Git → 5 Questions

    Do NOT generate 20 React questions while ignoring Python or FastAPI. Make sure you cover all matched skills.

    ---

    PROJECT QUESTIONS

    Generate ONLY from projects present in the Resume.
    Never invent projects.
    Questions should cover
    Architecture
    Authentication
    Database
    Challenges
    Libraries
    Deployment
    Project Decisions

    ---

    EXPERIENCE QUESTIONS
    Generate ONLY if professional experience exists.
    Questions should come from
    Responsibilities
    Production Bugs
    Optimization
    Architecture
    Deployment
    Team Collaboration

    ---

    STRICT RULES
    Never invent technologies.
    Never invent companies.
    Never invent projects.
    Never invent work experience.
    Never generate duplicate questions.
    Questions must feel like they were written after carefully reading the Resume.

    ---

    OUTPUT
    Return ONLY JSON.
    {json.dumps(INTERVIEW_SCHEMA, indent=2)}
    """

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
    prompt = f"""
    You are a Senior Software Engineering Interviewer at Google.
    Your task is to generate a detailed interview explanation for ONE interview question.

    ########################################
    CANDIDATE RESUME
    ########################################
    {resume_text}

    ########################################
    JOB DESCRIPTION
    ########################################
    {job_description}

    ########################################
    INTERVIEW QUESTION
    ########################################
    {question}

    ########################################
    YOUR TASK
    ########################################
    Generate:

    1. AI Tip
    2. Sample Interview Answer
    3. Key Points
    4. Common Mistakes
    5. Follow-up Questions

    The answer must be personalized according to the candidate's resume and the target Job Description.

    ########################################
    RULES
    ########################################
    - Never invent companies.
    - Never invent projects.
    - Never invent experience.
    - Fully answer the question asked, explaining any technologies, concepts, or frameworks mentioned in the question itself.
    - Keep the sample answer interview-ready.
    - Keep the answer concise (150-250 words).
    - Key points should be short bullet points.
    - Common mistakes should be realistic.
    - Follow-up questions should naturally continue the interview.
    - Return ONLY valid JSON.
    - No markdown.
    - No explanation.
    - No code block.

    ########################################
    OUTPUT JSON
    ########################################
    Return EXACTLY this structure:

    {json.dumps(DETAILS_SCHEMA, indent=2)}
    """
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
    prompt = f"""
    You are a Senior Software Engineering Interviewer at Google.
    Your task is to generate a personalized sample interview answer for ONE interview question.

    ########################################
    CANDIDATE RESUME
    ########################################
    {resume_text}

    ########################################
    JOB DESCRIPTION
    ########################################
    {job_description}

    ########################################
    INTERVIEW QUESTION
    ########################################
    {question}

    ########################################
    YOUR TASK
    ########################################
    Generate a personalized Sample Interview Answer according to the candidate's resume and the target Job Description.

    ########################################
    RULES
    ########################################
    - Never invent companies.
    - Never invent projects.
    - Never invent experience.
    - Fully answer the question asked, explaining any technologies, concepts, or frameworks mentioned in the question itself.
    - Keep the sample answer interview-ready.
    - Keep the answer concise (150-250 words).
    - Return ONLY valid JSON.
    - No markdown.
    - No explanation.
    - No code block.

    ########################################
    OUTPUT JSON
    ########################################
    Return EXACTLY this structure:

    {{
      "answer": {{
        "sample_answer": "your sample answer text here"
      }}
    }}
    """
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
