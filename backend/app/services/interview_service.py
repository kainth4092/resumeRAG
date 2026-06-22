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
                model="openai/gpt-oss-20b:free",
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


INTERVIEW_SCHEMA = {
    "technical": [
        {
            "question": "",
            "difficulty": "Easy|Medium|Hard",
            "tip": {"title": "AI Tip", "content": ""},
            "answer": {"sample_answer": "", "duration": "2-3 minutes"},
            "key_points": ["", ""],
            "common_mistakes": ["", ""],
            "follow_up_questions": ["", ""],
        }
    ],
    "hr": [],
    "behavioral": [],
    "coding": [],
    "project": [],
}


def generate_interview_questions(
    resume_text: str,
    job_description: str,
):
    prompt = f"""
    You are a Senior Technical Interviewer at top product companies like Google, Microsoft, Amazon, Adobe and Atlassian.
    Your task is to generate personalized interview questions using BOTH the candidate's resume and the Job Description.

    ##############################
    CANDIDATE RESUME
    ##############################
    {resume_text}

    ##############################
    JOB DESCRIPTION
    ##############################
    {job_description}

    ##############################
    OBJECTIVE
    ##############################
    Generate realistic interview questions that an interviewer would ask this candidate.
    Questions MUST be based on
    • Candidate Resume
    • Projects
    • Skills
    • Experience
    • Job Description

    ##############################
    QUESTION DISTRIBUTION
    ##############################
    Generate EXACTLY
    8 Technical Questions
    5 HR Questions
    5 Behavioral Questions
    4 Coding Questions
    8 Project Questions
    Total = 30 Questions

    ##############################
    PROJECT QUESTIONS
    ##############################
    Project questions MUST come from the candidate's actual resume.
    Examples
    Why did you choose React?
    Explain your ResumeRAG architecture.
    Why FastAPI?
    How did you implement JWT?
    How does your ATS Analysis work?
    How did you parse PDF?
    Explain authentication flow.
    What challenges did you face?
    Never ask questions about projects that do not exist.
    
    ##############################
    CODING QUESTIONS
    ##############################
    Coding questions should be related to technologies in both the Resume and Job Description.
    Examples
    React
    Python
    FastAPI
    JavaScript
    SQL
    Algorithms
    API Design
    
    ##############################
    TECHNICAL QUESTIONS
    ##############################
    Questions should test
    Architecture
    Concepts
    Frameworks
    Libraries
    Problem Solving
    Best Practices

    ##############################
    HR QUESTIONS
    ##############################
    Examples
    Tell me about yourself.
    Why should we hire you?
    Why this company?
    Greatest strength?
    Greatest weakness?

    ##############################
    BEHAVIORAL QUESTIONS
    ##############################
    Use STAR style questions.

    ##############################
    DIFFICULTY
    ##############################
    Difficulty must be one of
    Easy
    Medium
    Hard
    
    ##############################
    EVERY QUESTION MUST CONTAIN
    ##############################
    Question
    Difficulty
    AI Tip
    Sample Answer
    Estiamted Duration
    Key Points
    Commom Mistakes
    Follow-up Questions

    ##############################
    STRICT RULES
    ##############################
    Never invent companies.
    Never invent experience.
    Never invent projects.
    Never invent certifications. 
    Use only resume information.
    Return ONLY valid JSON.
    No markdown.
    No explanation.
    No code block.  

    ##############################
    OUTPUT JSON
    ##############################   
    Return EXACTLY this JSON:
    {json.dumps(INTERVIEW_SCHEMA, indent=2)}
    """

    response = call_llm_with_retry(prompt)
    return extract_json(response)


def evaluate_interview_answer(
    question: str,
    ideal_answer: dict,
    user_answer: str,
):

    prompt = f"""
    You are a Senior Software Engineering Interviewer.
    Evaluate the candidate's interview answer.

    #####################################
    QUESTION
    #####################################
    {question}

    #####################################
    IDEAL ANSWER
    #####################################
    {ideal_answer}

    #####################################
    CANDIDATE ANSWER
    #####################################
    {user_answer}

    #####################################
    EVALUATION CRITERIA
    #####################################
    Evaluate the answer based on
    1. Technical Accuracy
    2. Communication
    3. Confidence
    4. Completeness
    5. Clarity

    #####################################
    SCORING
    #####################################
    overall : 0-100
    technical : 0-100
    communication : 0-100
    confidence : 0-100

    #####################################
    RETURN
    #####################################
    Strengths
    Weaknesses
    Missing Points
    Improved Answer
    Actionable Feedback

    #####################################
    OUTPUT JSON
    #####################################
    {
        "evaluation": {
            "overall": 0,
            "technical": 0,
            "communication": 0,
            "confidence": 0,
            "strengths": [
             ""
            ],
            "weaknesses": [
                ""
            ],
            "missing_points": [
                ""
            ],
            "feedback": "",
            "improved_answer": ""
        }
    }
    Return ONLY valid JSON.
    No markdown.
    No explanation.
    No code block.
    """

    response = call_llm_with_retry(prompt)
    return extract_json(response)
