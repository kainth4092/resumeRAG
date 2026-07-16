import random
from typing import List, Dict, Optional
from app.interview.schemas.question import QuestionBankItem
from collections import defaultdict


class QuestionRandomizer:
    @staticmethod
    def select_questions(
        pool: List[QuestionBankItem],
        length: int = 10,
        difficulty_distribution: Optional[Dict[str, float]] = None,
        priority_skills: Optional[List[str]] = None,
    ) -> List[QuestionBankItem]:
        if not pool:
            return []

        # Ensure distinct items
        unique_pool = list({q.id: q for q in pool}.values())

        if len(unique_pool) <= length:
            selected = list(unique_pool)
            random.shuffle(selected)
            return selected

        # If no distribution is specified, select purely randomly
        if not difficulty_distribution:
            return random.sample(unique_pool, length)

        # Segment pool by difficulty
        easy_pool = [q for q in unique_pool if q.difficulty.title() == "Easy"]
        medium_pool = [q for q in unique_pool if q.difficulty.title() == "Medium"]
        hard_pool = [q for q in unique_pool if q.difficulty.title() == "Hard"]

        # Calculate target counts
        targets = {}
        total_allocated = 0

        # Order is important: assign largest portions first
        sorted_dist = sorted(
            difficulty_distribution.items(), key=lambda x: x[1], reverse=True
        )
        for diff, ratio in sorted_dist:
            target_count = int(round(length * ratio))
            targets[diff.title()] = target_count
            total_allocated += target_count

        # Adjust for rounding errors
        diff_error = length - total_allocated
        if diff_error != 0 and sorted_dist:
            primary_diff = sorted_dist[0][0].title()
            targets[primary_diff] = max(0, targets.get(primary_diff, 0) + diff_error)

        selected = []
        selected_ids = set()

        priority_skills = [
            s.strip().lower() for s in (priority_skills or []) if s and s.strip()
        ]

        # ---------------------------------------------------
        # STEP 1
        # Group remaining questions by difficulty + skill
        # ---------------------------------------------------

        difficulty_skill_map = {
            "Easy": defaultdict(list),
            "Medium": defaultdict(list),
            "Hard": defaultdict(list),
        }
        difficulty_pools = {
            "Easy": easy_pool,
            "Medium": medium_pool,
            "Hard": hard_pool,
        }
        for diff, items in difficulty_pools.items():
            for item in items:
                skill = item.skills[0].strip().lower() if item.skills else "__unknown__"
                difficulty_skill_map[diff][skill].append(item)

        # ---------------------------------------------------
        # STEP 2
        # First pass
        # Give every priority skill one question
        # ---------------------------------------------------

        for diff, target in targets.items():

            while len([q for q in selected if q.difficulty.title() == diff]) < target:

                added = False

                for skill in priority_skills:

                    skill_pool = difficulty_skill_map[diff].get(skill)

                    if not skill_pool:
                        continue

                    random.shuffle(skill_pool)

                    candidate = skill_pool.pop()

                    if candidate.id in selected_ids:
                        continue

                    selected.append(candidate)
                    selected_ids.add(candidate.id)
                    added = True

                    break

                if not added:
                    break

        # ---------------------------------------------------

        # STEP 3
        # Balanced Fill
        # ---------------------------------------------------

        remaining_by_skill = defaultdict(list)

        for diff in difficulty_skill_map.values():
            for skill, items in diff.items():
                remaining_by_skill[skill].extend(items)

        skill_names = list(remaining_by_skill.keys())

        random.shuffle(skill_names)

        while len(selected) < length:

            added = False

            for skill in skill_names:

                if not remaining_by_skill[skill]:
                    continue

                candidate = remaining_by_skill[skill].pop()

                if candidate.id in selected_ids:
                    continue

                selected.append(candidate)
                selected_ids.add(candidate.id)

                added = True

                if len(selected) >= length:
                    break

            if not added:
                break

        random.shuffle(selected)

        return selected[:length]
