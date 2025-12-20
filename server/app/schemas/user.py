from datetime import datetime
from models.enums import Role, AvailableLanguages
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserSchemaWithouChannelRead(BaseModel):
    id: int
    hashed_password: str
    email: Optional[EmailStr]
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserChannelSchemaRead(BaseModel):
    id: int
    description: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    is_subscribed: Optional[bool] = False
    subscriber_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUserPreferencesRead(BaseModel):
    id: int
    user_id: int
    autoplay: bool
    language: AvailableLanguages
    notifications_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSchemaRead(BaseModel):
    id: int
    hashed_password: str
    email: Optional[EmailStr]
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role
    created_at: datetime
    updated_at: datetime
    channel: Optional[UserChannelSchemaRead] = None
    user_preferences: UserUserPreferencesRead

    class Config:
        from_attributes = True


class UserSchemaAdd(BaseModel):
    email: Optional[EmailStr]
    username: Optional[str] = None
    hashed_password: str
    avatar_url: Optional[str] = None
    role: Role = Role.USER


class RegisterSchema(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(None, min_length=5, max_length=50)
    password: str = Field(min_length=8, max_length=50)


class LoginSchema(BaseModel):
    login: str
    password: str
