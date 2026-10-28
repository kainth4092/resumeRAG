import json
from pathlib import Path
from qdrant_client import QdrantClient
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank
from app.services.qdrant_service import (
    create_collection,
    upsert_question,
    COLLECTION_NAME,
)

QUESTIONS_PATH = (
    Path(__file__).resolve().parent.parent / "interview" / "data" / "interview_questions.json"
)


def sync_questions():
    if not QUESTIONS_PATH.is_file():
        raise FileNotFoundError(
            f"Required question bank file not found at: {QUESTIONS_PATH}. "
            "Please ensure backend/app/interview/data/interview_questions.json exists."
        )

    # 1. Number of JSON questions loaded
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        json_count = len(data)


    # 2. Number of vectors already existing (batch scroll check)
    vectors_existing = 0
    existing_ids = set()
    try:
        client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        if client.collection_exists(COLLECTION_NAME):
            # scroll retrieves points in batches, limit to 10000 to cover all
            records, _ = client.scroll(
                collection_name=COLLECTION_NAME,
                limit=10000,
                with_payload=False,
                with_vectors=False,
            )
            existing_ids = {r.id for r in records}
            vectors_existing = len(existing_ids)
    except Exception as e:
        print(f"Warning: Could not query Qdrant collection: {e}")

    db = SessionLocal()
    create_collection()
    questions = db.query(InterviewQuestionBank).all()
    print(f"Found {len(questions)} questions in SQL database.")

    inserted_count = 0
    skipped_count = 0
    failed_ids = []
    try:
        for question in questions:
            if question.id in existing_ids:
                skipped_count += 1
                continue

            try:
                inserted = upsert_question(
                    question,
                    force_update=True,
                )

                if inserted:
                    inserted_count += 1
                else:
                    skipped_count += 1

            except Exception as exc:
                failed_ids.append(question.id)
                print(f"Failed to sync question ID " f"{question.id}: {exc}")
    finally:
        db.close()

    print("\n--- Sync Audit Report ---")
    print(f"Number of JSON questions loaded: {json_count}")
    print(f"Number of vectors already existing: {vectors_existing}")
    print(f"Number of embeddings generated: {inserted_count}")
    print(f"Number of vectors inserted: {inserted_count}")
    print(f"Number of questions skipped (already in Qdrant): {skipped_count}")
    print(f"Number of failed question vectors: {len(failed_ids)}")
    if failed_ids:
        print(
            "Failed question IDs: "
            + ", ".join(str(question_id) for question_id in failed_ids)
        )
    print("-------------------------\n")
    if failed_ids:
        print(
            "Sync completed with failures. "
            "Run the script again to retry missing vectors."
        )
    else:
        print("Sync completed successfully.")
    db.close()


if __name__ == "__main__":
    sync_questions()
