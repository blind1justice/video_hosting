from models.base import Base
from sqlalchemy import CheckConstraint, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from schemas.comment import CommentSchemaRead



class Comment(Base):
    __tablename__ = 'comments'

    _table_args__ = (
        CheckConstraint(
            '(video_id IS NULL) != (parent_id IS NULL)',
            name='check_video_or_parent_not_null'
        ),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    video_id: Mapped[int | None] = mapped_column(Integer, ForeignKey('videos.id', ondelete='CASCADE'), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)
    content: Mapped[str] = mapped_column(Text())
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship('User', back_populates='comments')
    parent = relationship('Comment', back_populates='comments', remote_side=[id])
    comments = relationship('Comment', back_populates='parent')
    video = relationship('Video', back_populates='comments')
    reactions = relationship('Reaction', back_populates='comment')

    def to_read_model(self):
        return CommentSchemaRead.model_validate(self)
