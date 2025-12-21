from sqlalchemy import text
from db.session import async_session
from models.comment import Comment
from models.enums import ReactionType
from schemas.comment import CommetExtendedSchemaRead
from repositories.base import BaseRepository

class CommentRepository(BaseRepository):
    model = Comment

    async def get_all_for_video(self, video_id: int, user_id: int | None = None):
        select_parts = """
            c.id AS comment_id,
            c.video_id,
            c.parent_id,
            c.content,
            c.is_edited,
            c.created_at AS comment_created_at,
            c.updated_at AS comment_updated_at,
            
            u.id AS user_id,
            u.email AS user_email,
            u.username AS user_username,
            u.avatar_url AS user_avatar_url,
            u.role AS user_role,
            u.created_at AS user_created_at,
            u.updated_at AS user_updated_at,
            
            COALESCE(replies_cnt.replies_count, 0) AS replies_count,
            COALESCE(like_cnt.like_count, 0) AS like_count,
            COALESCE(dislike_cnt.dislike_count, 0) AS dislike_count
        """

        if user_id is not None:
            select_parts += """,
                (like_exists.user_id IS NOT NULL) AS is_liked,
                (dislike_exists.user_id IS NOT NULL) AS is_disliked
            """

        sql = text(f"""
            SELECT {select_parts}
            FROM comments c
            JOIN users u ON c.user_id = u.id
            
            LEFT JOIN (
                SELECT parent_id, COUNT(*) AS replies_count
                FROM comments
                WHERE parent_id IS NOT NULL
                GROUP BY parent_id
            ) replies_cnt ON replies_cnt.parent_id = c.id
            
            LEFT JOIN (
                SELECT comment_id, COUNT(*) AS like_count
                FROM reactions
                WHERE type = :like_type AND comment_id IS NOT NULL
                GROUP BY comment_id
            ) like_cnt ON like_cnt.comment_id = c.id
            
            LEFT JOIN (
                SELECT comment_id, COUNT(*) AS dislike_count
                FROM reactions
                WHERE type = :dislike_type AND comment_id IS NOT NULL
                GROUP BY comment_id
            ) dislike_cnt ON dislike_cnt.comment_id = c.id
            
            {"""
            LEFT JOIN reactions like_exists
                ON like_exists.comment_id = c.id
                AND like_exists.type = :like_type
                AND like_exists.user_id = :user_id
            
            LEFT JOIN reactions dislike_exists
                ON dislike_exists.comment_id = c.id
                AND dislike_exists.type = :dislike_type
                AND dislike_exists.user_id = :user_id
            """ if user_id is not None else ""}
            
            WHERE c.video_id = :video_id
              AND c.parent_id IS NULL
            ORDER BY c.id ASC
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
            rows = result.fetchall()

            comments = []
            for row in rows:
                comment_data = {
                    "id": row.comment_id,
                    "video_id": row.video_id,
                    "parent_id": row.parent_id,
                    "content": row.content,
                    "is_edited": row.is_edited,
                    "created_at": row.comment_created_at,
                    "updated_at": row.comment_updated_at,
                    "replies_count": row.replies_count,
                    "like_count": row.like_count,
                    "dislike_count": row.dislike_count,
                    "is_liked": row.is_liked if user_id is not None else False,
                    "is_disliked": row.is_disliked if user_id is not None else False,
                    "user": {
                        "id": row.user_id,
                        "email": row.user_email,
                        "username": row.user_username,
                        "avatar_url": row.user_avatar_url,
                        "role": row.user_role,
                        "created_at": row.user_created_at,
                        "updated_at": row.user_updated_at,
                    }
                }
                comments.append(CommetExtendedSchemaRead.model_validate(comment_data))

            return comments

    async def get_all_for_comment(self, comment_id: int, user_id: int | None = None):
        select_parts = """
            c.id AS comment_id,
            c.video_id,
            c.parent_id,
            c.content,
            c.is_edited,
            c.created_at AS comment_created_at,
            c.updated_at AS comment_updated_at,
            
            u.id AS user_id,
            u.email AS user_email,
            u.username AS user_username,
            u.avatar_url AS user_avatar_url,
            u.role AS user_role,
            u.created_at AS user_created_at,
            u.updated_at AS user_updated_at,
            
            COALESCE(like_cnt.like_count, 0) AS like_count,
            COALESCE(dislike_cnt.dislike_count, 0) AS dislike_count
        """

        if user_id is not None:
            select_parts += """,
                (like_exists.user_id IS NOT NULL) AS is_liked,
                (dislike_exists.user_id IS NOT NULL) AS is_disliked
            """

        sql = text(f"""
            SELECT {select_parts}
            FROM comments c
            JOIN users u ON c.user_id = u.id
            
            LEFT JOIN (
                SELECT comment_id, COUNT(*) AS like_count
                FROM reactions
                WHERE type = :like_type AND comment_id IS NOT NULL
                GROUP BY comment_id
            ) like_cnt ON like_cnt.comment_id = c.id
            
            LEFT JOIN (
                SELECT comment_id, COUNT(*) AS dislike_count
                FROM reactions
                WHERE type = :dislike_type AND comment_id IS NOT NULL
                GROUP BY comment_id
            ) dislike_cnt ON dislike_cnt.comment_id = c.id
            
            {"""
            LEFT JOIN reactions like_exists
                ON like_exists.comment_id = c.id
                AND like_exists.type = :like_type
                AND like_exists.user_id = :user_id
            
            LEFT JOIN reactions dislike_exists
                ON dislike_exists.comment_id = c.id
                AND dislike_exists.type = :dislike_type
                AND dislike_exists.user_id = :user_id
            """ if user_id is not None else ""}
            
            WHERE c.parent_id = :comment_id
            ORDER BY c.id ASC
        """)

        params = {
            "comment_id": comment_id,
            "like_type": ReactionType.LIKE.name,
            "dislike_type": ReactionType.DISLIKE.name,
        }
        if user_id is not None:
            params["user_id"] = user_id

        async with async_session() as session:
            result = await session.execute(sql, params)
            rows = result.fetchall()

            comments = []
            for row in rows:
                comment_data = {
                    "id": row.comment_id,
                    "video_id": row.video_id,
                    "parent_id": row.parent_id,
                    "content": row.content,
                    "is_edited": row.is_edited,
                    "created_at": row.comment_created_at,
                    "updated_at": row.comment_updated_at,
                    "replies_count": 0,
                    "like_count": row.like_count,
                    "dislike_count": row.dislike_count,
                    "is_liked": row.is_liked if user_id is not None else False,
                    "is_disliked": row.is_disliked if user_id is not None else False,
                    "user": {
                        "id": row.user_id,
                        "email": row.user_email,
                        "username": row.user_username,
                        "avatar_url": row.user_avatar_url,
                        "role": row.user_role,
                        "created_at": row.user_created_at,
                        "updated_at": row.user_updated_at,
                    }
                }
                comments.append(CommetExtendedSchemaRead.model_validate(comment_data))

            return comments
