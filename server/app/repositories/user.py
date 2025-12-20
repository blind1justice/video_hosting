from db.session import async_session
from models import User, Subscription, Channel
from repositories.base import BaseRepository
from schemas.user import UserSchemaRead

from sqlalchemy import select, func, exists
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
            
    async def get_user_with_channel(self, user_id: int, warden_id=None):
        async with async_session() as session:
            sub_count = (
                select(func.count(Subscription.id))
                .where(Subscription.channel_id == Channel.id)
                .scalar_subquery()
                .label("subscriber_count")
            )

            query = (
                select(self.model)
                .options(joinedload(self.model.channel))
                .options(joinedload(self.model.user_preferences))
                .add_columns(sub_count)
                .where(self.model.id == user_id)
            )

            if warden_id is not None:
                sub_exists = (
                    exists()
                    .where(Subscription.channel_id == Channel.id)
                    .where(Subscription.subscriber_id == warden_id)
                    .correlate(Channel)
                )

                query = query.add_columns(sub_exists.label("is_subscribed"))

            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                userschema = UserSchemaRead.model_validate(row[0])
                if userschema.channel:
                    userschema.channel.subscriber_count = row[1] if userschema.channel else 0
                    userschema.channel.is_subscribed = row[2] if warden_id else False
                return userschema
            else:
                return None
