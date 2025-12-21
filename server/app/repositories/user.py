from db.session import async_session
from models import User, Subscription, Channel
from repositories.base import BaseRepository
from schemas.user import UserSchemaRead

from sqlalchemy import select, func, exists, text
from sqlalchemy.orm import selectinload, joinedload


class UserRepository(BaseRepository):
    model = User

    async def get_user_by_email(self, email: str):
        sql = text(f"""
            SELECT * FROM {self.model.__tablename__}
            WHERE email = :email
        """)

        async with async_session() as session:
            result = await session.execute(sql, {"email": email})
            row = result.fetchone()
            if row:
                instance = self.model(**dict(row._mapping))
                return instance.to_read_model()
            return None

    async def get_user_by_username(self, username: str):
        sql = text(f"""
            SELECT * FROM {self.model.__tablename__}
            WHERE username = :username
        """)

        async with async_session() as session:
            result = await session.execute(sql, {"username": username})
            row = result.fetchone()
            if row:
                instance = self.model(**dict(row._mapping))
                return instance.to_read_model()
            return None
            
    async def get_user_with_channel(self, user_id: int, warden_id: int | None = None):
        select_parts = """
            u.id AS user_id,
            u.hashed_password,
            u.email AS user_email,
            u.username AS user_username,
            u.avatar_url AS user_avatar_url,
            u.role AS user_role,
            u.created_at AS user_created_at,
            u.updated_at AS user_updated_at,
            
            up.id AS pref_id,
            up.autoplay AS pref_autoplay,
            up.language AS pref_language,
            up.notifications_enabled AS pref_notifications_enabled,
            up.created_at AS pref_created_at,
            up.updated_at AS pref_updated_at,
            
            c.id AS channel_id,
            c.description AS channel_description,
            c.country AS channel_country,
            c.language AS channel_language,
            c.created_at AS channel_created_at,
            c.updated_at AS channel_updated_at,
            
            COALESCE(sub_cnt.subscriber_count, 0) AS subscriber_count
        """

        if warden_id is not None:
            select_parts += """,
                (sub_exists.subscriber_id IS NOT NULL) AS is_subscribed
            """

        sql = text(f"""
            SELECT {select_parts}
            FROM users u
            LEFT JOIN user_preferences up ON up.user_id = u.id
            LEFT JOIN channels c ON c.user_id = u.id
            
            LEFT JOIN (
                SELECT channel_id, COUNT(*) AS subscriber_count
                FROM subscriptions
                GROUP BY channel_id
            ) sub_cnt ON sub_cnt.channel_id = c.id
            
            {"""
            LEFT JOIN subscriptions sub_exists
                ON sub_exists.channel_id = c.id
                AND sub_exists.subscriber_id = :warden_id
            """ if warden_id is not None else ""}

            WHERE u.id = :user_id
        """)

        params = {
            "user_id": user_id,
        }
        if warden_id is not None:
            params["warden_id"] = warden_id

        async with async_session() as session:
            result = await session.execute(sql, params)
            row = result.fetchone()

            if not row:
                return None

            user_data = {
                "id": row.user_id,
                "hashed_password": row.hashed_password,
                "email": row.user_email,
                "username": row.user_username,
                "avatar_url": row.user_avatar_url,
                "role": row.user_role,
                "created_at": row.user_created_at,
                "updated_at": row.user_updated_at,
                "user_preferences": {
                    "id": row.pref_id,
                    "user_id": row.user_id,
                    "autoplay": row.pref_autoplay,
                    "language": row.pref_language,
                    "notifications_enabled": row.pref_notifications_enabled,
                    "created_at": row.pref_created_at,
                    "updated_at": row.pref_updated_at,
                },
            }

            if row.channel_id:
                channel_data = {
                    "id": row.channel_id,
                    "description": row.channel_description,
                    "country": row.channel_country,
                    "language": row.channel_language,
                    "created_at": row.channel_created_at,
                    "updated_at": row.channel_updated_at,
                    "subscriber_count": row.subscriber_count,
                    "is_subscribed": row.is_subscribed if warden_id is not None else False,
                }
                user_data["channel"] = channel_data
            else:
                user_data["channel"] = None

            return UserSchemaRead.model_validate(user_data)
