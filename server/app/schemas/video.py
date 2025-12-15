from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from models.enums import VideoStatus


class VideoUploadSchema(BaseModel):
    channel_id: int
    title: str
    description: Optional[str]
    storage_key: str
    thumbnail_key: str
    original_format: str


class TinyVideoSchemaRead(BaseModel):
    id: int
    channel_id: int
    title: str
    status: VideoStatus
    description: Optional[str] = None
    duration: int
    original_format: str

    class Config:
        from_attributes = True


class VideoUserRead(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str]

    class Config:
        from_attributes = True


class VideoChannelRead(BaseModel):
    id: int
    description: Optional[str]
    language: Optional[str]
    country: Optional[str]
    user: VideoUserRead

    class Config:
        from_attributes = True


class VideoSchemaWithChannelRead(BaseModel):
    id: int
    title: str
    status: VideoStatus
    description: Optional[str] = None
    duration: int
    original_format: str
    storage_key: str
    thumbnail_key: str
    channel: VideoChannelRead
    image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VideoSchemaWithChannelDetailRead(VideoSchemaWithChannelRead):
    video_file: Optional[str] = None

    class Config:
        from_attributes = True
