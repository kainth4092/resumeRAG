from typing import Any

_embedding_model: Any = None


def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from fastembed import TextEmbedding

        _embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _embedding_model


def build_text(question) -> str:
    tags = " ".join(question.tags or [])
    return f"""
    Skill: {question.skill}

    Category: {question.category}

    Experience: {question.experience_level}

    Question:
    {question.question}

    Answer:
    {question.answer}

    Tags:
    {tags}
    """


def get_embedding(text: str) -> list[float]:
    model = get_embedding_model()
    embedding = next(model.embed([text]))
    return embedding.tolist()
