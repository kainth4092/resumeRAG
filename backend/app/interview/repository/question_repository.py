from typing import List, Optional
from app.interview.schemas.question import QuestionBankItem
from app.interview.loader.json_loader import JSONQuestionLoader

class QuestionRepository:
    _instance = None
    _questions: List[QuestionBankItem] = []
    _loaded = False

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(QuestionRepository, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self, loader: Optional[JSONQuestionLoader] = None):
        self.loader = loader or JSONQuestionLoader()

    def get_all(self, force_reload: bool = False) -> List[QuestionBankItem]:
        if not self._loaded or force_reload:
            self._questions = self.loader.load_questions()
            self._loaded = True
        return self._questions

    def get_by_id(self, question_id: str) -> Optional[QuestionBankItem]:
        for q in self.get_all():
            if q.id == question_id:
                return q
        return None
