import json
from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank
from app.interview.services.interview_bank_service import classify_difficulty


def normalize_key_text(value: str) -> str:
    return " ".join((value or "").strip().lower().split())


def seed_questions():
    db = SessionLocal()

    with open(
        "app/data/interview_questions.json",
        "r",
        encoding="utf-8",
    ) as file:
        questions = json.load(file)
        # -----------------------------------------
        # Remove duplicate questions from JSON
        # -----------------------------------------
        unique_questions = []
        seen = set()

        for item in questions:

            key = (
                normalize_key_text(item.get("question", "")),
                normalize_key_text(item.get("skill", "")),
            )

            if key in seen:
                print(
                    f"Skipping duplicate JSON question: " f"{item.get('question')[:80]}"
                )
                continue

            seen.add(key)
            unique_questions.append(item)

        questions = unique_questions

    json_count = len(questions)
    inserted_count = 0
    updated_count = 0
    skipped_count = 0

    # Fetch all existing questions in one query
    existing_qs = db.query(InterviewQuestionBank).all()
    lookup = {}
    for q in existing_qs:
        lookup[
            (
                normalize_key_text(q.question),
                normalize_key_text(q.skill),
            )
        ] = q

    for item in questions:
        q_text = item["question"].strip()
        q_skill = item["skill"].strip()
        key = (
            normalize_key_text(q_text),
            normalize_key_text(q_skill),
        )
        difficulty = (
            (
                item.get("difficulty")
                or classify_difficulty(
                    question_text=q_text,
                    experience_level=item["experience_level"],
                    skill=q_skill,
                )
            )
            .strip()
            .title()
        )

        if difficulty not in {"Easy", "Medium", "Hard"}:
            raise ValueError(
                f"Invalid difficulty '{difficulty}' for question: {q_text}"
            )

        if key in lookup:
            exists = lookup[key]
            updated = False
            source_val = item.get("source", "Admin")
            if exists.source != source_val:
                exists.source = source_val
                updated = True
            if exists.answer != item["answer"]:
                exists.answer = item["answer"]
                updated = True
            if exists.category != item["category"]:
                exists.category = item["category"]
                updated = True
            if exists.experience_level != item["experience_level"]:
                exists.experience_level = item["experience_level"]
                updated = True
            if exists.difficulty != difficulty:
                exists.difficulty = difficulty
                updated = True

            if updated:
                db.add(exists)
                updated_count += 1
            else:
                skipped_count += 1
            continue

        question = InterviewQuestionBank(
            question=item["question"],
            answer=item["answer"],
            skill=item["skill"],
            category=item["category"],
            experience_level=item["experience_level"],
            difficulty=difficulty,
            company=item.get("company"),
            role=item.get("role"),
            tags=item.get("tags", []),
            source=item.get("source", "Admin"),
        )

        db.add(question)
        lookup[key] = question
        inserted_count += 1

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print(f"Number of JSON questions loaded: {json_count}")
    print(f"Number of questions skipped (already in SQL DB): " f"{skipped_count}")
    print(f"Number of questions updated in SQL DB: " f"{updated_count}")
    print(f"Number of questions inserted in SQL DB: " f"{inserted_count}")


if __name__ == "__main__":
    seed_questions()
