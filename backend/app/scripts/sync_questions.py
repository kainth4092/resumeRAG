import json
from qdrant_client import QdrantClient
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.interview_bank import InterviewQuestionBank
from app.services.qdrant_service import create_collection, upsert_question, COLLECTION_NAME


def sync_questions():
    # 1. Number of JSON questions loaded
    json_count = 0
    try:
        with open("app/data/interview_questions.json", "r") as f:
            data = json.load(f)
            json_count = len(data)
    except Exception as e:
        print(f"Warning: Could not load JSON questions: {e}")

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

    for question in questions:
        if question.id in existing_ids:
            skipped_count += 1
            continue

        # upsert_question returns True if inserted, False if skipped
        inserted = upsert_question(question, force_update=True)
        if inserted:
            inserted_count += 1
        else:
            skipped_count += 1

    print("\n--- Sync Audit Report ---")
    print(f"Number of JSON questions loaded: {json_count}")
    print(f"Number of vectors already existing: {vectors_existing}")
    print(f"Number of embeddings generated: {inserted_count}")
    print(f"Number of vectors inserted: {inserted_count}")
    print(f"Number of questions skipped (already in Qdrant): {skipped_count}")
    print("-------------------------\n")
    print("Sync Completed.")
    db.close()


if __name__ == "__main__":
    sync_questions()
