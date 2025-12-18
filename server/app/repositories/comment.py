from repositories.base import BaseRepository
from models import Comment, User, Reaction, Video
from models.enums import ReactionType
from sqlalchemy import delete, select, func, exists
from sqlalchemy.orm import joinedload, aliased
from db.session import async_session
from schemas.comment import CommetExtendedSchemaRead


class CommentRepository(BaseRepository):
    model = Comment

    async def get_all_for_video(self, video_id: int, user_id=None):
        async with async_session() as session:
            replies_alias = aliased(Comment)

            replies_subquery = (
                select(func.count(replies_alias.id))
                .where(replies_alias.parent_id == Comment.id)
                .scalar_subquery()
                .label("replies_count")
            )

            like_count = (
                select(func.count(Reaction.id))
                .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.LIKE))
                .scalar_subquery()
                .label("like_count")
            )

            dislike_count = (
                select(func.count(Reaction.id))
                .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.DISLIKE))
                .scalar_subquery()
                .label("like_count")
            )

            query = (
                select(Comment, replies_subquery)
                .join(Comment.user)
                .options(
                    joinedload(Comment.user)
                )
                .add_columns(like_count, dislike_count)
                .where(Comment.video_id==video_id)
                .order_by(Comment.id)
            )

            if user_id is not None:
                like_exists = (
                    exists()
                    .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.LIKE))
                    .where(Reaction.user_id == user_id)
                    .correlate(Comment)
                )

                dislike_exists = (
                    exists()
                    .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.DISLIKE))
                    .where(Reaction.user_id == user_id)
                    .correlate(Comment)
                )

                query = query.add_columns( 
                    like_exists.label("is_liked"),
                    dislike_exists.label("is_disliked")
                )

            res = await session.execute(query)
            rows = []
            for row in res.all():
                comment_schema = CommetExtendedSchemaRead.model_validate(row[0])
                comment_schema.replies_count = row[1]
                comment_schema.like_count = row[2]
                comment_schema.dislike_count = row[3]
                comment_schema.is_liked = row[4] if user_id else False
                comment_schema.is_disliked = row[5] if user_id else False
                rows.append(comment_schema)
            return rows

    async def get_all_for_comment(self, comment_id: int, user_id=None):
        async with async_session() as session:
            like_count = (
                select(func.count(Reaction.id))
                .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.LIKE))
                .scalar_subquery()
                .label("like_count")
            )

            dislike_count = (
                select(func.count(Reaction.id))
                .where((Reaction.comment_id == Comment.id) & (Reaction.type==ReactionType.DISLIKE))
                .scalar_subquery()
                .label("like_count")
            )

            query = (
                select(Comment)
                .join(Comment.user)
                .options(
                    joinedload(Comment.user)
                )
                .add_columns(like_count, dislike_count)
                .where(Comment.parent_id==comment_id)
                .order_by(Comment.id)
            )

            res = await session.execute(query)
            res = [CommetExtendedSchemaRead.model_validate(row[0]) for row in res.all()]
            return res
