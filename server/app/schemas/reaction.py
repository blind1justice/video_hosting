from datetime import datetime
from pydantic import BaseModel

from models.enums import ReactionType


class ReactionSchemaAdd(BaseModel):
    user_id: int
    video_id: int
    type: ReactionType


class ReactionSchemaRead(BaseModel):
    id: int
    user_id: int
    video_id: int
    type: ReactionType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
