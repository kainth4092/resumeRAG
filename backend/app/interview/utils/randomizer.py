import random
from typing import List, Dict, Optional
from app.interview.schemas.question import QuestionBankItem

class QuestionRandomizer:
    @staticmethod
    def select_questions(
        pool: List[QuestionBankItem],
        length: int = 10,
        difficulty_distribution: Optional[Dict[str, float]] = None
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
        sorted_dist = sorted(difficulty_distribution.items(), key=lambda x: x[1], reverse=True)
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
        pools = {
            "Easy": easy_pool,
            "Medium": medium_pool,
            "Hard": hard_pool
        }

        # Select from corresponding pools
        for diff, target in targets.items():
            pool_for_diff = pools.get(diff, [])
            count_to_take = min(target, len(pool_for_diff))
            selected_items = random.sample(pool_for_diff, count_to_take)
            selected.extend(selected_items)
            # Remove selected from pools to avoid duplicates
            pools[diff] = [item for item in pool_for_diff if item not in selected_items]

        # If we didn't meet the target length (e.g., not enough Easy questions),
        # fill the remaining slots from whatever is left in the overall pool.
        remaining_needed = length - len(selected)
        if remaining_needed > 0:
            flat_remaining_pool = []
            for p in pools.values():
                flat_remaining_pool.extend(p)
            
            if flat_remaining_pool:
                fill_items = random.sample(flat_remaining_pool, min(remaining_needed, len(flat_remaining_pool)))
                selected.extend(fill_items)

        # Shuffle final selection
        random.shuffle(selected)
        return selected
