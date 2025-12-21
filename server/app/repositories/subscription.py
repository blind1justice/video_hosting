from repositories.base import BaseRepository
from models.subscription import Subscription
from sqlalchemy import delete, text
from db.session import async_session


class SubscriptionRepository(BaseRepository):
    model = Subscription

    async def delete_by_subscriber_and_channel(self, subscriber_id, channel_id):
        sql = text(f"""
                DELETE FROM {self.model.__tablename__}
                WHERE subscriber_id = :subscriber_id 
                AND channel_id = :channel_id
        """)
        async with async_session() as session:
            result = await session.execute(sql, {
                "subscriber_id": subscriber_id, 
                "channel_id": channel_id
            })
            await session.commit()
            return result.rowcount > 0
