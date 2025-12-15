from models.video import Video
from models.channel import Channel
from repositories.base import BaseRepository
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from schemas.video import VideoSchemaWithChannelRead, VideoSchemaWithChannelDetailRead
from db.session import async_session


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


    async def get_one_with_channel(self, video_id: int):
        async with async_session() as session:
            query = (
                select(Video)
                .join(Video.channel)
                .join(Channel.user)
                .options(
                    joinedload(Video.channel).joinedload(Channel.user)
                )
                .where(Video.id == video_id)
            )

            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return VideoSchemaWithChannelDetailRead.model_validate(row[0])
            else:
                return None
