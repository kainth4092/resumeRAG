from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator


class GenerateInterviewRequest(BaseModel):
    resume_id: int
    job_description: str
    company: Optional[str] = None
    role: Optional[str] = None

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, value: str):
        value = value.strip()
        if len(value) < 30:
            raise ValueError("Job description is too short.")
        return value

    @field_validator("company", "role")
    @classmethod
    def clean_optional_fields(cls, value):
        if value:
            return value.strip()
        return value


class EvaluateAnswerRequest(BaseModel):
    question_id: int
    user_answer: str

    @field_validator("user_answer")
    @classmethod
    def validate_answer(cls, value: str):
        value = value.strip()
        if len(value) < 5:
            raise ValueError("Answer is too short.")
        return value


class EvaluationDetail(BaseModel):
    overall: float
    technical: float
    communication: float
    confidence: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    missingPoints: List[str] = []
    feedback: str
    improvedAnswer: str
    followUps: List[str] = []

class InterviewQuestionResponse(BaseModel):
    id: int
    category: str
    question: str
    difficulty: str
    tip: Optional[Any] = None
    answer: Optional[Any] = None
    key_points: List[str] = []
    common_mistakes: List[str] = []
    follow_up_questions: List[str] = []
    bookmarked: bool
    answered: bool
    user_answer: Optional[str] = None
    evaluation: Optional[EvaluationDetail] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str):
        allowed = {"Easy", "Medium", "Hard"}
        if value not in allowed:
            return "Medium"
        return value

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value: str):
        categories = {
            "technical": "Technical",
            "behavioral": "Behavioral",
            "hr": "HR",
            "coding": "Coding",
            "project": "Project",
        }
        return categories.get(value.lower(), value.title())

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionResponse(BaseModel):

    id: int
    resume_id: int
    company: Optional[str] = None
    role: Optional[str] = None
    job_description: str
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    model_config = ConfigDict(from_attributes=True)


class GenerateInterviewResponse(BaseModel):
    session: InterviewSessionResponse


class EvaluateAnswerResponse(BaseModel):

    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    feedback: str
    improved_answer: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    missing_points: List[str] = []



class InterviewHistoryItem(BaseModel):

    id: int
    company: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime
    questions_count: int
    avg_score: float
    model_config = ConfigDict(from_attributes=True)
