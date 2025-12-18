from models.base import Base
from models.enums import VideoStatus

from sqlalchemy import ForeignKey, Integer, Text, String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Video(Base):
    __tablename__ = 'videos'

    id: Mapped[int] = mapped_column(primary_key=True)
    channel_id: Mapped[int] = mapped_column(Integer, ForeignKey('channels.id', ondelete='CASCADE'))
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[VideoStatus] = mapped_column(Enum(VideoStatus), default=VideoStatus.PROCESSING)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    duration: Mapped[int] = mapped_column(default=0)
    original_format: Mapped[str] = mapped_column(String(30))
    storage_key: Mapped[str] = mapped_column(String(500))
    thumbnail_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    channel = relationship('Channel', back_populates='videos')
    reactions = relationship('Reaction', back_populates='video')
    comments = relationship('Comment', back_populates='video')
    reports = relationship('Report', back_populates='video')

    def to_read_model(self):
        from schemas.video import TinyVideoSchemaRead
        return TinyVideoSchemaRead.model_validate(self)
