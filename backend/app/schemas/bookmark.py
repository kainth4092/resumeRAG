from pydantic import (
    BaseModel,
    Field,
)


class BookmarkRequest(BaseModel):
    question_id: int = Field(
        ...,
        gt=0,
        description="Valid interview question ID",
    )
