from models.video import Video
from models.channel import Channel
from models.reaction import Reaction
from models.comment import Comment
from models.enums import ReactionType, VideoStatus
from repositories.base import BaseRepository
from sqlalchemy import select, or_, and_, exists, func, text
from sqlalchemy.orm import joinedload
from schemas.video import VideoSchemaWithChannelRead, VideoSchemaWithChannelDetailRead
from db.session import async_session
from models.subscription import Subscription


class VideoRepository(BaseRepository):
    model = Video

    async def get_all_with_channels(self, channel_id: int = None):
        sql = text(f"""
                SELECT 
                    v.id, v.title, v.status, v.description, v.duration,
                    v.original_format, v.storage_key, v.thumbnail_key,
                    v.created_at,
                    
                    c.id AS channel_id,
                    c.description AS channel_description,
                    c.language AS channel_language,
                    c.country AS channel_country,
                    
                    u.id AS user_id,
                    u.email AS user_email,
                    u.username AS user_username
                    
                FROM videos v
                JOIN channels c ON v.channel_id = c.id
                JOIN users u ON c.user_id = u.id
                WHERE v.status = :video_status
                    AND {'c.id = :channel_id' if channel_id else '1=1'}
                ORDER BY v.id DESC
            """)
        
        async with async_session() as session:
            result = await session.execute(sql, {
                "channel_id": channel_id,
                "video_status": VideoStatus.PROCESSED.value
            })
            rows = result.fetchall()

            videos = []
            for row in rows:
                video_data = {
                    "id": row.id,
                    "title": row.title,
                    "status": row.status,
                    "description": row.description,
                    "duration": row.duration,
                    "original_format": row.original_format,
                    "storage_key": row.storage_key,
                    "thumbnail_key": row.thumbnail_key,
                    "created_at": row.created_at,
                    "channel": {
                        "id": row.channel_id,
                        "description": row.channel_description,
                        "language": row.channel_language,
                        "country": row.channel_country,
                        "user": {
                            "id": row.user_id,
                            "email": row.user_email,
                            "username": row.user_username,
                        }
                    }
                }
                videos.append(VideoSchemaWithChannelRead.model_validate(video_data))

            return videos


    async def get_one_with_channel(self, video_id: int, user_id: int | None = None):
        select_parts = """
            v.id, v.title, v.status, v.description, v.duration,
            v.original_format, v.storage_key, v.thumbnail_key,
            v.created_at,
            
            c.id AS channel_id,
            c.description AS channel_description,
            c.language AS channel_language,
            c.country AS channel_country,
            
            u.id AS user_id,
            u.email AS user_email,
            u.username AS user_username,

            COALESCE(sub_cnt.subscriber_count, 0) AS subscriber_count,
            COALESCE(like_cnt.like_count, 0) AS like_count,
            COALESCE(dislike_cnt.dislike_count, 0) AS dislike_count,
            COALESCE(comment_cnt.comment_count, 0) AS comment_count
        """

        if user_id is not None:
            select_parts += """,
                CASE WHEN sub_exists.subscriber_id IS NOT NULL THEN true ELSE false END AS is_subscribed,
                CASE WHEN like_exists.user_id IS NOT NULL THEN true ELSE false END AS is_liked,
                CASE WHEN dislike_exists.user_id IS NOT NULL THEN true ELSE false END AS is_disliked
            """

        sql = text(f"""
            SELECT
                {select_parts}
            FROM videos v
            JOIN channels c ON v.channel_id = c.id
            JOIN users u ON c.user_id = u.id
            
            LEFT JOIN (
                SELECT channel_id, COUNT(*) AS subscriber_count
                FROM subscriptions
                GROUP BY channel_id
            ) sub_cnt ON sub_cnt.channel_id = c.id
            
            LEFT JOIN (
                SELECT video_id, COUNT(*) AS like_count
                FROM reactions
                WHERE type = :like_type
                GROUP BY video_id
            ) like_cnt ON like_cnt.video_id = v.id
            
            LEFT JOIN (
                SELECT video_id, COUNT(*) AS dislike_count
                FROM reactions
                WHERE type = :dislike_type
                GROUP BY video_id
            ) dislike_cnt ON dislike_cnt.video_id = v.id
            
            LEFT JOIN (
                SELECT 
                    c.video_id,
                    COUNT(*) AS comment_count
                FROM comments c
                WHERE c.video_id = :video_id
                   OR c.parent_id IN (
                       SELECT id FROM comments WHERE video_id = :video_id
                   )
                GROUP BY c.video_id
            ) comment_cnt ON comment_cnt.video_id = v.id
            
            {"""
            LEFT JOIN subscriptions sub_exists 
                ON sub_exists.channel_id = c.id 
                AND sub_exists.subscriber_id = :user_id
            
            LEFT JOIN reactions like_exists
                ON like_exists.video_id = v.id
                AND like_exists.type = :like_type
                AND like_exists.user_id = :user_id
            
            LEFT JOIN reactions dislike_exists
                ON dislike_exists.video_id = v.id
                AND dislike_exists.type = :dislike_type
                AND dislike_exists.user_id = :user_id
            """ if user_id is not None else ""}
            
            WHERE v.id = :video_id
        """)

        params = {
            "video_id": video_id,
            "like_type": ReactionType.LIKE.name,
            "dislike_type": ReactionType.DISLIKE.name,
        }
        if user_id is not None:
            params["user_id"] = user_id

        async with async_session() as session:
            result = await session.execute(sql, params)
            row = result.fetchone()

            if not row:
                return None

            video_data = {
                "id": row.id,
                "title": row.title,
                "status": row.status,
                "description": row.description,
                "duration": row.duration,
                "original_format": row.original_format,
                "storage_key": row.storage_key,
                "thumbnail_key": row.thumbnail_key,
                "created_at": row.created_at,
                "channel": {
                    "id": row.channel_id,
                    "description": row.channel_description,
                    "language": row.channel_language,
                    "country": row.channel_country,
                    "user": {
                        "id": row.user_id,
                        "email": row.user_email,
                        "username": row.user_username,
                    }
                },
                "subscriber_count": row.subscriber_count,
                "like_count": row.like_count,
                "dislike_count": row.dislike_count,
                "comment_count": row.comment_count,
                "is_subscribed": row.is_subscribed if user_id is not None else False,
                "is_liked": row.is_liked if user_id is not None else False,
                "is_disliked": row.is_disliked if user_id is not None else False,
            }

            return VideoSchemaWithChannelDetailRead.model_validate(video_data)
