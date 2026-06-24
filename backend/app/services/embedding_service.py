from fastembed import TextEmbedding

embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")


def build_text(question):
    return f"""
    Skill: {question.skill}

    Category: {question.category}

    Experience: {question.experience_level}

    Question:
    {question.question}

    Answer:
    {question.answer}

    Tags:
    {' '.join(question.tags or [])}
    """


def get_embedding(text: str):
    embedding = next(embedding_model.embed([text]))
    return embedding.tolist()
