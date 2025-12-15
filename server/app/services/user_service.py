from repositories.user import UserRepository
from services.base import BaseService

class UserService(BaseService):
    repo: UserRepository = UserRepository()

    async def get_user_by_email(self, email: str):
        res = await self.repo.get_user_by_email(email)
        return res
    
    async def get_user_by_username(self, username: str):
        res = await self.repo.get_user_by_username(username)
        return res
    
    async def get_user_with_channel(self, id: int):
        res = await self.repo.get_user_with_channel(id)
        return res
