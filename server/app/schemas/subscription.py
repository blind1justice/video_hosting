from datetime import datetime
from pydantic import BaseModel


class SubscriptionSchemaAdd(BaseModel):
    subscriber_id: int
    channel_id: int


class SubscriptionSchemaRead(BaseModel):
    id: int
    subscriber_id: int
    channel_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
