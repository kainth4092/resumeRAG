from pydantic import BaseModel


class BookmarkRequest(BaseModel):
    question_id: int
