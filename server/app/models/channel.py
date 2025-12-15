from schemas.channel import TinyChannelSchemaRead
from models.base import Base

from sqlalchemy import ForeignKey, Integer, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Channel(Base):
    __tablename__ = 'channels'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    country: Mapped[str | None] = mapped_column(String(50), nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)

    user = relationship('User', back_populates='channel')
    videos = relationship('Video', back_populates='channel')
    
    def to_read_model(self):
        return TinyChannelSchemaRead.model_validate(self)
