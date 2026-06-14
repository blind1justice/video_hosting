from models.base import Base
from schemas.notification import NotificationSchemaRead

from sqlalchemy import Integer, Text, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column


class Notification(Base):
    __tablename__ = 'notifications'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text())
    is_read: Mapped[bool] = mapped_column(Boolean, server_default=text('false'))

    def to_read_model(self):
        return NotificationSchemaRead.model_validate(self)
