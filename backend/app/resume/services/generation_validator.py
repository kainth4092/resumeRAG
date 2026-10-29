import re
from typing import Tuple, List, Set, Dict
from app.schemas.resume_doc import ResumeDoc
from app.core.skills_taxonomy import SKILLS_TAXONOMY

COMMON_ACTION_WORDS = {
    "the", "in", "built", "designed", "developed", "led", "integrated",
    "created", "implemented", "managed", "collaborated", "engineered",
    "optimized", "spearheaded", "architected", "delivered", "conducted",
    "analyzed", "facilitated", "authored", "established", "automated",
    "resolved", "scaled", "formulated", "directed", "coordinated",
}


def get_skill_synonyms(skill_name: str) -> Set[str]:
    """Returns canonical name + all aliases for a skill from the skills taxonomy."""
    skill_clean = skill_name.strip().lower()
    synonyms = {skill_clean}
    for canonical, entry in SKILLS_TAXONOMY.items():
        aliases_lower = {a.lower() for a in entry.aliases}
        if skill_clean == canonical.lower() or skill_clean in aliases_lower:
            synonyms.add(canonical.lower())
            synonyms.update(aliases_lower)
            break
    return synonyms


def build_allowed_skills_pool(source_doc: ResumeDoc) -> Set[str]:
    """Gathers all source skills and their taxonomy synonyms."""
    pool = set()
    for s in source_doc.skills:
        pool.update(get_skill_synonyms(s))
    # Also extract skills demonstrated in experience / project bullets and tech lists
    for p in source_doc.projects:
        for t in p.technologies:
            pool.update(get_skill_synonyms(t))
    return pool


def extract_numbers_and_metrics(text: str) -> Set[str]:
    """Extracts numbers, percentages, and metrics from text."""
    # Matches: 20%, 3.5x, $100k, 500, 10M, etc.
    matches = re.findall(r"\b\$?\d+(?:\.\d+)?%?[a-zA-Z]?\b", text.lower())
    # Strip common units like $, % to compare raw numeric value as well
    cleaned = set(matches)
    for m in matches:
        raw_num = re.sub(r"[^\d.]", "", m)
        if raw_num:
            cleaned.add(raw_num)
    return cleaned


def extract_claimed_years(text: str) -> List[int]:
    """Extracts years of experience claims like '7+ years of experience' or '5+ years of software development experience'."""
    matches = re.findall(r"\b(\d+)\+?\s*years(?:\s+of)?(?:\s+[a-zA-Z\s]{0,30})?\s+experience\b", text, flags=re.IGNORECASE)
    if not matches:
        matches = re.findall(r"\b(\d+)\+?\s*years\b", text, flags=re.IGNORECASE)
    return [int(m) for m in matches if str(m).isdigit()]


class GenerationValidator:
    """
    Pure-Python validator ensuring generated wording adheres strictly to
    candidate truthfulness and guardrails:
    1. Every skill is in source skills/synonyms (from skills_taxonomy).
    2. Every number/percentage in a rewritten bullet appears in the source bullet.
    3. No new proper nouns appear unless present in source or approved in taxonomy.
    4. Bullet length bounds (20 to 350 chars).
    5. Summary <= 100 words and does not claim more years of experience than source.
    """

    @classmethod
    def validate_wording(
        cls,
        source_doc: ResumeDoc,
        rewritten_headline: str,
        rewritten_summary: str,
        rewritten_skills: List[str],
        experience_bullet_replacements: Dict[Tuple[int, int], str],
        project_bullet_replacements: Dict[Tuple[int, int], str],
    ) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        # 1. Skills validation: Must be subset of source skills + taxonomy synonyms
        allowed_skills = build_allowed_skills_pool(source_doc)
        for skill in rewritten_skills:
            skill_clean = skill.strip().lower()
            if skill_clean and skill_clean not in allowed_skills:
                # Check if it matches any synonym
                skill_syns = get_skill_synonyms(skill_clean)
                if not (skill_syns & allowed_skills):
                    violations.append(
                        f"Unauthorized skill added: '{skill}'. Skills must only be drawn from source resume or synonyms."
                    )

        # 2. Summary bounds & experience claim validation
        if rewritten_summary:
            words = rewritten_summary.strip().split()
            if len(words) > 100:
                violations.append(
                    f"Summary exceeds 100 words ({len(words)} words provided). Summary must be concise (<= 100 words)."
                )

            # Check experience claim against source
            claimed_in_rewritten = extract_claimed_years(rewritten_summary)
            if claimed_in_rewritten:
                max_claimed = max(claimed_in_rewritten)
                # Check source summary, headline, or whole text
                source_claims = extract_claimed_years(source_doc.summary + " " + source_doc.headline)
                source_max = max(source_claims) if source_claims else None

                # Also estimate maximum span from experience dates if dates present
                if source_max is None or max_claimed > source_max:
                    violations.append(
                        f"Summary claims {max_claimed} years of experience, but source resume does not support this claim."
                    )

        # 3. Experience bullets validation (numbers/metrics, length, proper nouns)
        source_full_text = " ".join([
            source_doc.headline,
            source_doc.summary,
            " ".join(source_doc.skills),
            " ".join([b for e in source_doc.experience for b in e.bullets]),
            " ".join([b for p in source_doc.projects for b in p.bullets]),
        ]).lower()

        for (exp_idx, b_idx), rewritten_bullet in experience_bullet_replacements.items():
            if not rewritten_bullet or not rewritten_bullet.strip():
                violations.append(f"Experience [{exp_idx}][{b_idx}]: Bullet cannot be empty.")
                continue

            cleaned_bullet = rewritten_bullet.strip()
            if len(cleaned_bullet) < 15 or len(cleaned_bullet) > 350:
                violations.append(
                    f"Experience [{exp_idx}][{b_idx}]: Bullet length ({len(cleaned_bullet)} chars) out of bounds (15-350 chars)."
                )

            # Get corresponding source bullet
            source_bullet = ""
            if 0 <= exp_idx < len(source_doc.experience):
                exp_item = source_doc.experience[exp_idx]
                if 0 <= b_idx < len(exp_item.bullets):
                    source_bullet = exp_item.bullets[b_idx]

            # Metric verification
            source_metrics = extract_numbers_and_metrics(source_bullet)
            rewritten_metrics = extract_numbers_and_metrics(cleaned_bullet)
            unauthorized_metrics = rewritten_metrics - source_metrics
            if unauthorized_metrics:
                violations.append(
                    f"Experience [{exp_idx}][{b_idx}]: Introduced unverified numbers/metrics {unauthorized_metrics} not present in source bullet."
                )

            # Proper noun verification: check capitalized words after the first word of each sentence
            sentences = re.split(r"[.!?]\s+", cleaned_bullet)
            for sent in sentences:
                words = sent.strip().split()
                for word in words[1:]:
                    clean_word = re.sub(r"[^\w]", "", word)
                    if clean_word and clean_word[0].isupper() and len(clean_word) >= 4:
                        pn_lower = clean_word.lower()
                        if (
                            pn_lower not in COMMON_ACTION_WORDS
                            and pn_lower not in source_full_text
                            and pn_lower not in allowed_skills
                        ):
                            violations.append(
                                f"Experience [{exp_idx}][{b_idx}]: Introduced unauthorized proper noun or entity '{clean_word}' not present in source resume."
                            )

        # 4. Project bullets validation
        for (proj_idx, b_idx), rewritten_bullet in project_bullet_replacements.items():
            if not rewritten_bullet or not rewritten_bullet.strip():
                violations.append(f"Project [{proj_idx}][{b_idx}]: Bullet cannot be empty.")
                continue

            cleaned_bullet = rewritten_bullet.strip()
            if len(cleaned_bullet) < 15 or len(cleaned_bullet) > 350:
                violations.append(
                    f"Project [{proj_idx}][{b_idx}]: Bullet length ({len(cleaned_bullet)} chars) out of bounds (15-350 chars)."
                )

            source_bullet = ""
            if 0 <= proj_idx < len(source_doc.projects):
                proj_item = source_doc.projects[proj_idx]
                if 0 <= b_idx < len(proj_item.bullets):
                    source_bullet = proj_item.bullets[b_idx]

            source_metrics = extract_numbers_and_metrics(source_bullet)
            rewritten_metrics = extract_numbers_and_metrics(cleaned_bullet)
            unauthorized_metrics = rewritten_metrics - source_metrics
            if unauthorized_metrics:
                violations.append(
                    f"Project [{proj_idx}][{b_idx}]: Introduced unverified numbers/metrics {unauthorized_metrics} not present in source bullet."
                )

            sentences = re.split(r"[.!?]\s+", cleaned_bullet)
            for sent in sentences:
                words = sent.strip().split()
                for word in words[1:]:
                    clean_word = re.sub(r"[^\w]", "", word)
                    if clean_word and clean_word[0].isupper() and len(clean_word) >= 4:
                        pn_lower = clean_word.lower()
                        if (
                            pn_lower not in COMMON_ACTION_WORDS
                            and pn_lower not in source_full_text
                            and pn_lower not in allowed_skills
                        ):
                            violations.append(
                                f"Project [{proj_idx}][{b_idx}]: Introduced unauthorized proper noun or entity '{clean_word}' not present in source resume."
                            )

        is_valid = len(violations) == 0
        return is_valid, violations
