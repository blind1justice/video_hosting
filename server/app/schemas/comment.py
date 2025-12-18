from datetime import datetime
from typing import Optional
from models.enums import Role
from pydantic import BaseModel, model_validator, EmailStr


class CommentSchemaEdit(BaseModel):
    content: str


class CommentSchemaAdd(BaseModel):
    video_id: Optional[int] = None
    parent_id: Optional[int] = None
    content: str

    @model_validator(mode='after')
    def validate(self):
        if ((self.video_id and self.parent_id) or
            (not self.video_id and not self.parent_id)
        ):
            raise ValueError('You must provider either video or comment, not both')
        return self


class CommentSchemaRead(BaseModel):
    id: int
    user_id: int
    video_id: Optional[int] = None
    parent_id: Optional[int] = None
    content: str
    is_edited: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CommentUserSchemaRead(BaseModel):
    id: int
    email: Optional[EmailStr]
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommetExtendedSchemaRead(BaseModel):
    id: int
    user: CommentUserSchemaRead
    video_id: Optional[int] = None
    parent_id: Optional[int] = None
    content: str
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    replies_count: Optional[int] = 0
    like_count: Optional[int] = 0
    dislike_count: Optional[int] = 0
    is_liked: Optional[bool] = False
    is_disliked: Optional[bool] = False

    class Config:
        from_attributes = True
