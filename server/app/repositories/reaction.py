from repositories.base import BaseRepository
from models.reaction import Reaction
from sqlalchemy import delete, select, text
from db.session import async_session


class ReactionRepository(BaseRepository):
    model = Reaction

    async def get_by_user_and_video(self, user_id, video_id):
        sql = text(f"""
                SELECT * FROM {self.model.__tablename__}
                WHERE user_id = :user_id
                AND video_id = :video_id
        """)
        async with async_session() as session:
            res = await session.execute(sql, {
                "user_id": user_id,
                "video_id": video_id 
            })
            row = res.fetchone()
            if row:
                instance = self.model(**dict(row._mapping))
                return instance.to_read_model()
            else:
                return None

    async def get_by_user_and_comment(self, user_id, comment_id):
        sql = text(f"""
                SELECT * FROM {self.model.__tablename__}
                WHERE user_id = :user_id
                AND comment_id = :comment_id
        """)
        async with async_session() as session:
            res = await session.execute(sql, {
                "user_id": user_id,
                "comment_id": comment_id 
            })
            row = res.fetchone()
            if row:
                instance = self.model(**dict(row._mapping))
                return instance.to_read_model()
            else:
                return None
