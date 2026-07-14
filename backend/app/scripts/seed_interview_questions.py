import json
from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank


def seed_questions():
    db = SessionLocal()

    with open(
        "app/data/interview_questions.json",
        "r",
        encoding="utf-8",
    ) as file:
        questions = json.load(file)

    json_count = len(questions)
    inserted_count = 0
    updated_count = 0
    skipped_count = 0

    # Fetch all existing questions in one query
    existing_qs = db.query(InterviewQuestionBank).all()
    lookup = {(q.question.strip(), q.skill.strip()): q for q in existing_qs}

    for item in questions:
        q_text = item["question"].strip()
        q_skill = item["skill"].strip()
        key = (q_text, q_skill)

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
            company=item.get("company"),
            role=item.get("role"),
            tags=item.get("tags", []),
            source=item.get("source", "Admin"),
        )

        db.add(question)
        inserted_count += 1

    db.commit()
    db.close()

    print(f"Number of JSON questions loaded: {json_count}")
    print(f"Number of questions skipped (already in SQL DB): {skipped_count}")
    print(f"Number of questions updated in SQL DB: {updated_count}")
    print(f"Number of questions inserted in SQL DB: {inserted_count}")


if __name__ == "__main__":
    seed_questions()
