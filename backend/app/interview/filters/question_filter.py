from typing import List, Set
from app.interview.schemas.question import QuestionBankItem

class QuestionFilter:
    @staticmethod
    def filter_by_difficulty(questions: List[QuestionBankItem], difficulties: Set[str]) -> List[QuestionBankItem]:
        if not difficulties:
            return questions
        normalized = {d.strip().title() for d in difficulties if d}
        return [q for q in questions if q.difficulty.title() in normalized]

    @staticmethod
    def filter_by_category(questions: List[QuestionBankItem], categories: Set[str]) -> List[QuestionBankItem]:
        if not categories:
            return questions
        normalized = {c.strip().lower() for c in categories if c}
        return [q for q in questions if q.category.lower() in normalized]

    @staticmethod
    def filter_by_type(questions: List[QuestionBankItem], question_types: Set[str]) -> List[QuestionBankItem]:
        if not question_types:
            return questions
        normalized = {t.strip().lower() for t in question_types if t}
        return [q for q in questions if q.question_type.lower() in normalized]

    @staticmethod
    def filter_by_skills(questions: List[QuestionBankItem], skills: Set[str]) -> List[QuestionBankItem]:
        if not skills:
            return questions
        normalized_skills = {s.strip().lower() for s in skills if s}
        filtered = []
        for q in questions:
            q_skills = {qs.lower() for qs in q.skills}
            # If the question matches any of the target skills, include it
            if q_skills.intersection(normalized_skills):
                filtered.append(q)
        return filtered
