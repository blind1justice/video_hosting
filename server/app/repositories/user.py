from db.session import async_session
from models import User
from repositories.base import BaseRepository

from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload


class UserRepository(BaseRepository):
    model = User

    async def get_user_by_email(self, email: str):
        async with async_session() as session:
            query = select(self.model).where(self.model.email == email)
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model()
            else:
                return None
    
    async def get_user_by_username(self, username: str):
        async with async_session() as session:
            query = select(self.model).where(self.model.username == username)
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model()
            else:
                return None
            
    async def get_user_with_channel(self, user_id: int):
        query = select(self.model).where(self.model.id == user_id).options(joinedload(self.model.channel))
        async with async_session() as session:
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model_with_channel()
            else:
                return None
