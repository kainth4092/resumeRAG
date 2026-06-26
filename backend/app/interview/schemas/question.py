from pydantic import BaseModel, Field
from typing import List, Optional, Any

class QuestionBankItem(BaseModel):
    id: str = Field(..., description="Unique identifier for the curated question")
    question: str = Field(..., description="The interview question text")
    category: str = Field(..., description="HR | Behavioral | Technical | Aptitude | Coding | Scenario Based | Project Based")
    difficulty: str = Field(..., description="Easy | Medium | Hard")
    skills: List[str] = Field(default_factory=list, description="Associated skills, e.g., React, Python")
    question_type: str = Field(..., description="Short Answer | Coding | MCQ | Scenario | Project Discussion | Debugging | Theory")
    estimated_duration: Optional[str] = "2-3 minutes"
    sample_answer: Optional[str] = None
    key_points: Optional[List[str]] = None
    common_mistakes: Optional[List[str]] = None
    follow_up_questions: Optional[List[str]] = None

class InterviewPipelineConfig(BaseModel):
    length: int = 10
    difficulty_distribution: Optional[dict] = None  # e.g., {"Easy": 0.3, "Medium": 0.5, "Hard": 0.2}
    hybrid_mode: bool = False 
