from fastapi import HTTPException, status
from repositories.channel import ChannelRepository
from services.base import BaseService

class ChannelService(BaseService):
    repo: ChannelRepository = ChannelRepository()

    async def add_to_user(self, item, user_id):
        if await self.repo.get_one_by_user_id(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Channel already exists',
            )
        item_dict = item.model_dump()
        item_dict['user_id'] = user_id
        res = await self.repo.add_one(item_dict)
        return res
