from repositories.base import BaseRepository
from models.subscription import Subscription
from sqlalchemy import delete
from db.session import async_session


class SubscriptionRepository(BaseRepository):
    model = Subscription

    async def delete_by_subscriber_and_channel(self, subscriber_id, channel_id):
        async with async_session() as session:
            query = delete(self.model).where(
                (self.model.subscriber_id==subscriber_id) &
                (self.model.channel_id==channel_id)
            )
            result = await session.execute(query)
            await session.commit()
            return result.rowcount > 0
