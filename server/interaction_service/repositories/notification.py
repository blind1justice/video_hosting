from models import Notification
from repositories.base import BaseRepository
from sqlalchemy import select, update
from db.session import async_session


class NotificationRepository(BaseRepository):
    model = Notification

    async def get_user_notifications(self, user_id: int):
        async with async_session() as session:
            query = (
                select(self.model)
                .where(self.model.user_id==user_id)
                .order_by(self.model.created_at.desc())
            )
            res = await session.execute(query)
            res = [row[0].to_read_model() for row in res.all()]
            return res
        
    async def mark_all_as_read(self, user_id: int):
        async with async_session() as session:
            stmt = update(self.model).where(self.model.user_id==user_id).values(is_read=True).returning(self.model)
            res = await session.execute(stmt)
            await session.commit()
            res = [row[0].to_read_model() for row in res.all()]
            return res
