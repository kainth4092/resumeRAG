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
    count = 0
    for item in questions:
        exists = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.question == item["question"],
                InterviewQuestionBank.skill == item["skill"],
            )
            .first()
        )
        if exists:
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
        count += 1

    db.commit()
    db.close()

    print(f"Inserted {count} questions.")


if __name__ == "__main__":
    seed_questions()
