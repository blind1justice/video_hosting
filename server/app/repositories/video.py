from models.video import Video
from models.channel import Channel
from models.reaction import Reaction
from models.comment import Comment
from models.enums import ReactionType
from repositories.base import BaseRepository
from sqlalchemy import select, or_, and_, exists, func
from sqlalchemy.orm import joinedload
from schemas.video import VideoSchemaWithChannelRead, VideoSchemaWithChannelDetailRead
from db.session import async_session
from models.subscription import Subscription


class VideoRepository(BaseRepository):
    model = Video

    async def get_all_with_channels(self, channel_id: int = None):
        async with async_session() as session:
            query = (
                select(Video)
                .join(Video.channel)
                .join(Channel.user)
                .options(
                    joinedload(Video.channel).joinedload(Channel.user)
                )
                .order_by(Video.id.desc())
            )

            if channel_id:
                query = query.where(Channel.id == channel_id)

            res = await session.execute(query)
            res = [VideoSchemaWithChannelRead.model_validate(row[0]) for row in res.all()]
            return res


    async def get_one_with_channel(self, video_id: int, user_id=None):
        async with async_session() as session:
            sub_count = (
                select(func.count(Subscription.id))
                .where(Subscription.channel_id == Channel.id)
                .scalar_subquery()
                .label("subscriber_count")
            )

            like_count = (
                select(func.count(Reaction.id))
                .where((Reaction.video_id == Video.id) & (Reaction.type==ReactionType.LIKE))
                .scalar_subquery()
                .label("like_count")
            )

            dislike_count = (
                select(func.count(Reaction.id))
                .where((Reaction.video_id == Video.id) & (Reaction.type==ReactionType.DISLIKE))
                .scalar_subquery()
                .label("dislike_count")
            )

            comment_count = (
                select(func.count(Comment.id))
                .where(
                    or_(
                        Comment.video_id == Video.id,
                        Comment.parent_id.in_(
                            select(Comment.id)
                            .where(Comment.video_id == Video.id)
                            .correlate(Video)
                        )
                    )
                )
                .scalar_subquery()
                .label("comment_count")
            )

            query = (
                select(Video)
                .join(Video.channel)
                .join(Channel.user)
                .options(
                    joinedload(Video.channel).joinedload(Channel.user)
                )
                .add_columns(sub_count, like_count, dislike_count, comment_count)
                .where(Video.id == video_id)
            )
            
            if user_id is not None:
                sub_exists = (
                    exists()
                    .where(Subscription.channel_id == Channel.id)
                    .where(Subscription.subscriber_id == user_id)
                    .correlate(Channel)
                )

                like_exists = (
                    exists()
                    .where((Reaction.video_id == Video.id) & (Reaction.type==ReactionType.LIKE))
                    .where(Reaction.user_id == user_id)
                    .correlate(Video)
                )

                dislike_exists = (
                    exists()
                    .where((Reaction.video_id == Video.id) & (Reaction.type==ReactionType.DISLIKE))
                    .where(Reaction.user_id == user_id)
                    .correlate(Video)
                )
            
                query = query.add_columns(
                    sub_exists.label("is_subscribed"), 
                    like_exists.label("is_liked"),
                    dislike_exists.label("is_disliked")
                )

            res = await session.execute(query)
            row = res.one_or_none()

            if row:
                videoschema = VideoSchemaWithChannelDetailRead.model_validate(row[0])
                videoschema.subscriber_count = row[1]
                videoschema.like_count = row[2]
                videoschema.dislike_count = row[3]
                videoschema.comment_count = row[4]
                videoschema.is_subscribed = row[5] if user_id else False
                videoschema.is_liked = row[6] if user_id else False
                videoschema.is_disliked = row[7] if user_id else False
                return videoschema
            else:
                return None
