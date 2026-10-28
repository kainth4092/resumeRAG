from collections import OrderedDict
from typing import List
from app.core.skills_taxonomy import (
    extract_skills_from_text as taxonomy_extract_skills,
    normalize_skill,
    TAXONOMY_ENTRIES,
)

COMMON_SKILLS = [entry.canonical_name for entry in TAXONOMY_ENTRIES]
SKILL_ALIASES = {
    alias.lower(): entry.canonical_name
    for entry in TAXONOMY_ENTRIES
    for alias in entry.aliases
}


class SkillMatchingService:

    @staticmethod
    def normalize(skill: str) -> str:
        return normalize_skill(skill)

    @classmethod
    def extract_skills_from_text(cls, text: str) -> List[str]:
        return taxonomy_extract_skills(text)

    @classmethod
    def match_candidate_skills(
        cls,
        resume_text: str,
        jd_text: str,
    ) -> List[str]:
        resume_skills = cls.extract_skills_from_text(resume_text)
        jd_skills = cls.extract_skills_from_text(jd_text)

        jd_set = set(jd_skills)
        matched = [s for s in resume_skills if s in jd_set]
        remaining = [s for s in resume_skills if s not in jd_set]

        ordered = matched + remaining
        seen = OrderedDict()
        for skill in ordered:
            seen[skill] = None

        return list(seen.keys())
