from models.base import Base
from models.enums import ReactionType
from sqlalchemy import CheckConstraint, Index, Column, Enum, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from schemas.reaction import ReactionSchemaRead


class Reaction(Base):
    __tablename__ = 'reactions'

    __table_args__ = (
        CheckConstraint(
            '(video_id IS NULL) != (comment_id IS NULL)',
            name='check_video_or_comment_not_null'
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    video_id: Mapped[int] = mapped_column(Integer, ForeignKey('videos.id', ondelete='CASCADE'), nullable=True)
    comment_id: Mapped[int] = mapped_column(Integer, ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)
    type: Mapped[ReactionType] = mapped_column(Enum(ReactionType))

    user = relationship('User', back_populates='reactions')
    video = relationship('Video', back_populates='reactions')
    comment = relationship('Comment', back_populates='reactions')

    def to_read_model(self):
        return ReactionSchemaRead.model_validate(self)
