from typing import List


class ResumeQueryBuilder:
    @staticmethod
    def build_query(headline: str, skills: List[str]) -> str:
        clean_headline = (headline or "").strip()
        clean_skills = [skill.strip() for skill in skills if skill][:3]
        
        parts = []
        if clean_headline:
            parts.append(clean_headline)
        if clean_skills:
            parts.extend(clean_skills)
            
        return " ".join(parts).strip()
