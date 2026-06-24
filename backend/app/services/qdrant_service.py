from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.services.embedding_service import build_text, get_embedding

client = QdrantClient(host="localhost", port=6333)

COLLECTION_NAME = "interview_question_bank"


def create_collection():
    collections = client.get_collections()

    names = [c.name for c in collections.collections]

    if COLLECTION_NAME in names:
        print("Collection already exists")
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )
    print("Collection Created.")


def upsert_question(question):
    text = build_text(question)
    vector = get_embedding(text)

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=question.id,
                vector=vector,
                payload={
                    "question_id": question.id,
                    "skill": question.skill,
                    "category": question.category,
                    "question": question.question,
                },
            )
        ],
    )


def search_questions(query: str, limit: int = 20):
    vector = get_embedding(query)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit,
    )

    return results.points


def search_question_ids(query: str, limit: int = 20):
    results = search_questions(
        query=query,
        limit=limit,
    )
    ids = []
    for item in results:
        question_id = item.payload.get("question_id")
        if question_id:
            ids.append(question_id)
    return ids


def delete_question_vector(question_id: int):
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=[question_id],
    )
