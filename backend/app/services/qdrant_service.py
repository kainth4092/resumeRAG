import logging

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from qdrant_client.http import models as rest

from app.core.config import settings
from app.core.exceptions import QdrantAppException
from app.services.embedding_service import build_text, get_embedding

logger = logging.getLogger(__name__)

_client: QdrantClient | None = None

COLLECTION_NAME = "interview_question_bank"


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        if not settings.QDRANT_URL:
            raise QdrantAppException("Qdrant URL is not configured.")

        client_kwargs: dict[str, object] = {"url": settings.QDRANT_URL}
        if settings.QDRANT_API_KEY:
            client_kwargs["api_key"] = settings.QDRANT_API_KEY

        _client = QdrantClient(**client_kwargs)
    return _client


def ensure_collection_exists() -> None:
    client = get_client()
    try:
        if client.collection_exists(COLLECTION_NAME):
            logger.info("Qdrant collection already exists: %s", COLLECTION_NAME)
            return

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
        logger.info("Qdrant collection created: %s", COLLECTION_NAME)
    except Exception as exc:
        logger.error("Failed to ensure Qdrant collection: %s", exc, exc_info=True)
        raise QdrantAppException() from exc


def create_collection():
    ensure_collection_exists()


def upsert_question(question, force_update: bool = False) -> bool:
    try:
        ensure_collection_exists()

        if not force_update:
            try:
                existing = get_client().retrieve(
                    collection_name=COLLECTION_NAME,
                    ids=[question.id],
                )
                if existing:
                    logger.info("Question ID %d already exists in Qdrant, skipping duplicate insertion.", question.id)
                    return False
            except Exception as check_err:
                logger.warning("Failed to check if question ID %d exists in Qdrant: %s", question.id, check_err)

        text = build_text(question)
        vector = get_embedding(text)

        get_client().upsert(
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
        return True
    except Exception as exc:
        logger.error("Failed to upsert question %s: %s", question.id, exc, exc_info=True)
        raise QdrantAppException() from exc


def search_questions(query: str, limit: int = 20):
    try:
        ensure_collection_exists()
        vector = get_embedding(query)

        results = get_client().query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=limit,
        )

        return results.points
    except Exception as exc:
        logger.error("Failed to search questions: %s", exc, exc_info=True)
        raise QdrantAppException() from exc


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
    try:
        ensure_collection_exists()
        get_client().delete(
            collection_name=COLLECTION_NAME,
            points_selector=rest.PointIdsList(points=[question_id]),
        )
    except Exception as exc:
        logger.error("Failed to delete question vector %s: %s", question_id, exc, exc_info=True)
        raise QdrantAppException() from exc
