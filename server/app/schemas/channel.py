from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models.enums import Role, VideoStatus


class TinyChannelSchemaRead(BaseModel):
    id: int
    user_id: int
    description: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChannelVideoSchemaRead(BaseModel):
    id: int
    channel_id: int
    title: str
    status: VideoStatus
    description: Optional[str] = None
    duration: int
    original_format: str
    storage_key: str

    class Config:
        from_attributes = True


class ChannelUserSchemaRead(BaseModel):
    id: int
    hashed_password: str
    email: Optional[EmailStr]
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role

    class Config:
        from_attributes = True


class ChannelWithVideosSchemaRead(BaseModel):
    id: int
    user: ChannelUserSchemaRead
    description: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    videos: List[ChannelVideoSchemaRead]

    class Config:
        from_attributes = True


class ChannelAddSchema(BaseModel):
    description: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
