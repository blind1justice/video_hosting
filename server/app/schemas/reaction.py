from datetime import datetime
from typing import Optional
from pydantic import BaseModel, model_validator

from models.enums import ReactionType


class ReactionSchemaAdd(BaseModel):
    user_id: int
    video_id: Optional[int] = None
    comment_id: Optional[int] = None
    type: ReactionType

    @model_validator(mode='after')
    def validate(self):
        if ((self.video_id and self.comment_id) or
            (not self.video_id and not self.comment_id)
        ):
            raise ValueError('You must provider either video or comment, not both')
        return self


class ReactionSchemaRead(BaseModel):
    id: int
    user_id: int
    video_id: Optional[int] = None
    comment_id: Optional[int] = None
    type: ReactionType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
