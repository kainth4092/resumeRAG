from pydantic import BaseModel, ConfigDict


class ResumeeResponse(BaseModel):
    id: int
    title: str
    original_filename: str

    model_config = ConfigDict(from_attributes=True)
