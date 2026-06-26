from typing import List


class ResumeQueryBuilder:
    @staticmethod
    def build_query(headline: str, skills: List[str]) -> str:
        clean_headline = (headline or "").strip()
        
        headline_words = set(clean_headline.lower().split())
        
        unique_skills = []
        for skill in skills:
            skill_clean = (skill or "").strip()
            if skill_clean and skill_clean.lower() not in headline_words:
                unique_skills.append(skill_clean)
                
        clean_skills = unique_skills[:2]
        
        parts = []
        if clean_headline:
            parts.append(clean_headline)
        if clean_skills:
            parts.extend(clean_skills)
            
        return " ".join(parts).strip()
