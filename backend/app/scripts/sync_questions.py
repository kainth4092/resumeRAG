from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank
from app.services.qdrant_service import create_collection, upsert_question


def sync_questions():
    db = SessionLocal()
    create_collection()
    questions = db.query(InterviewQuestionBank).all()
    print(f"Found {len(questions)} questions.")

    for question in questions:
        upsert_question(question)
    print("Sync Completed.")
    db.close()


if __name__ == "__main__":
    sync_questions()
