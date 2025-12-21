from repositories.base import BaseRepository
from models import Report, Video, User, Channel
from schemas.report import ReportExtendedSchemaRead
from db.session import async_session
from sqlalchemy import text
from sqlalchemy.orm import joinedload, aliased


class ReportRepository(BaseRepository):
    model = Report

    async def get_all_extended(self):
        sql = text("""
            SELECT 
                r.id, r.reporter_id, r.video_id, r.reason, r.status, r.created_at, r.updated_at,
                rep.id AS rep_id, rep.email AS rep_email, rep.username AS rep_username,
                v.id AS v_id, v.title, v.status AS v_status, v.description AS v_desc,
                v.duration, v.original_format, v.storage_key, v.thumbnail_key, v.created_at,
                ch.id AS ch_id, ch.description AS ch_desc, ch.language, ch.country,
                owner.id AS owner_id, owner.email AS owner_email, owner.username AS owner_username
            FROM reports r
            JOIN users rep ON rep.id = r.reporter_id
            JOIN videos v ON v.id = r.video_id
            JOIN channels ch ON ch.id = v.channel_id
            JOIN users owner ON owner.id = ch.user_id
            WHERE r.status = 'PENDING'
            ORDER BY r.id DESC
        """)

        async with async_session() as session:
            result = await session.execute(sql)
            rows = result.fetchall()

            reports = []
            for row in rows:
                extended_data = {
                    "id": row.id,
                    "reason": row.reason,
                    "status": row.status,
                    "created_at": row.created_at,
                    "updated_at": row.updated_at,
                    "reporter": {
                        "id": row.rep_id,
                        "email": row.rep_email,
                        "username": row.rep_username,
                    },
                    "video": {
                        "id": row.v_id,
                        "title": row.title,
                        "status": row.v_status,
                        "description": row.v_desc,
                        "duration": row.duration,
                        "original_format": row.original_format,
                        "storage_key": row.storage_key,
                        "thumbnail_key": row.thumbnail_key,
                        "created_at": row.created_at,
                        "channel": {
                            "id": row.ch_id,
                            "description": row.ch_desc,
                            "language": row.language,
                            "country": row.country,
                            "user": {
                                "id": row.owner_id,
                                "email": row.owner_email,
                                "username": row.owner_username,
                            }
                        }
                    }
                }
                reports.append(ReportExtendedSchemaRead.model_validate(extended_data))

            return reports
