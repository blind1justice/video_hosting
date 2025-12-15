from schemas.channel import ChannelWithVideosSchemaRead
from models.video import Video
from models.enums import VideoStatus
from models.channel import Channel
from repositories.base import BaseRepository
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from db.session import async_session


class ChannelRepository(BaseRepository):
    model = Channel

    async def get_one_by_user_id(self, user_id):
        async with async_session() as session:
            query = select(self.model).where(self.model.user_id==user_id)
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model()
            else:
                return None
            
    async def get_one_with_all_videos(self, channel_id):
        async with async_session() as session:
            query = (
                select(self.model)
                .options(
                    selectinload(self.model.user),
                    selectinload(self.model.videos)
                )
                .where(self.model.id == channel_id)
            )
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return ChannelWithVideosSchemaRead.model_validate(row[0])

