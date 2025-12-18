from repositories.base import BaseRepository
from models.reaction import Reaction
from sqlalchemy import delete, select
from db.session import async_session


class ReactionRepository(BaseRepository):
    model = Reaction

    async def get_by_user_and_video(self, user_id, video_id):
        async with async_session() as session:
            query = select(self.model).where(
                (self.model.user_id==user_id) &
                (self.model.video_id==video_id)
            )
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model()
            else:
                return None

    async def get_by_user_and_comment(self, user_id, comment_id):
        async with async_session() as session:
            query = select(self.model).where(
                (self.model.user_id==user_id) &
                (self.model.comment_id==comment_id)
            )
            res = await session.execute(query)
            row = res.one_or_none()
            if row:
                return row[0].to_read_model()
            else:
                return None
