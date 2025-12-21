from schemas.channel import ChannelWithVideosSchemaRead
from models.video import Video
from models.enums import VideoStatus
from models.channel import Channel
from repositories.base import BaseRepository
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload
from db.session import async_session


class ChannelRepository(BaseRepository):
    model = Channel

    async def get_one_by_user_id(self, user_id: int):
        sql = text("""
            SELECT *
            FROM channels
            WHERE user_id = :user_id
        """)

        async with async_session() as session:
            result = await session.execute(sql, {"user_id": user_id})
            row = result.fetchone()

            if not row:
                return None

            instance = self.model(**dict(row._mapping))
            return instance.to_read_model()
