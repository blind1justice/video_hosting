from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from models.enums import AvailableLanguages


class UserPreferencesAdd(BaseModel):
    user_id: int


class UserPreferencesUpdate(BaseModel):
    autoplay: bool
    language: AvailableLanguages
    notifications_enabled: bool


class UserPreferencesRead(BaseModel):
    id: int
    user_id: int
    autoplay: bool
    language: AvailableLanguages
    notifications_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
