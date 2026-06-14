from datetime import datetime

from pydantic import BaseModel


class NotificationSchemaAdd(BaseModel):
    user_id: int
    content: str


class NotificationSchemaRead(BaseModel):
    id: int
    user_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
