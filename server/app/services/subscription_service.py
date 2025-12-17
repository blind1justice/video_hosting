from repositories.subscription import SubscriptionRepository
from services.base import BaseService
from fastapi import HTTPException, status
from schemas.subscription import SubscriptionSchemaAdd


class SubscriptionService(BaseService):
    repo: SubscriptionRepository = SubscriptionRepository()

    async def subscribe(self, subscriber_id, channel_id):
        subscritpion_schema = SubscriptionSchemaAdd(subscriber_id=subscriber_id, channel_id=channel_id)
        try:
            return await self.repo.add_one(subscritpion_schema.model_dump())
        except Exception as e:
            raise HTTPException(detail="Something went wrong", status_code=status.HTTP_400_BAD_REQUEST)

    async def unsubscribe(self, subscriber_id, channel_id):
        try:
            return await self.repo.delete_by_subscriber_and_channel(subscriber_id, channel_id)
        except:
            raise HTTPException(detail="Something went wrong", status_code=status.HTTP_400_BAD_REQUEST)

    