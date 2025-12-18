from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from models.enums import ReportStatus, Role, VideoStatus


class ReportSchemaAdd(BaseModel):
    video_id: int
    reason: str


class ReportSchemaRead(BaseModel):
    id: int
    reporter_id: int
    video_id: int
    reason: str
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    class Config: 
        from_attributes = True


class ReportUserSchemaRead(BaseModel):
    id: int
    email: Optional[EmailStr]
    username: Optional[str] = None

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


class ReportVideoSchemaRead(BaseModel):
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


class ReportExtendedSchemaRead(BaseModel):
    id: int
    reporter: ReportUserSchemaRead
    video: ReportVideoSchemaRead
    reason: str
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    class Config: 
        from_attributes = True