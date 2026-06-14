import json

import aio_pika

from repositories.report import ReportRepository
from services.video_service import VideoService
from services.s3_service import S3Service
from services.base import BaseService
from models.enums import ReportStatus
from fastapi import HTTPException, status


class ReportService(BaseService):
    repo: ReportRepository = ReportRepository()

    def __init__(self, s3_service: S3Service, video_service: VideoService):
        self.s3_service = s3_service
        self.video_service = video_service
    
    async def left_report(self, user_id, report_schema):
        report = await self.repo.get_by_reporter_and_video(user_id, report_schema.video_id)
        if report and report.status != ReportStatus.REJECTED:
            raise HTTPException(
                detail='Report already exists', 
                status_code=status.HTTP_409_CONFLICT
            )
        report_schema = report_schema.model_dump()
        report_schema['reporter_id'] = user_id
        res = await self.repo.add_one(report_schema)
        return res

    async def mark_rejected(self, report_id):
        report = await self.repo.get_one(report_id)
        res = await self.repo.update_one(report_id, {"status": ReportStatus.REJECTED})
        message_body = json.dumps({
            "user_id": report.reporter_id,
            "content": "Видео по вашей жалобе не было удалено"
        }).encode()
        message = aio_pika.Message(
            message_body,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )

        await self.video_service.rabbit_client.connect()
        exchange = await self.video_service.rabbit_client.channel.get_exchange("tasks_exchange")
        await exchange.publish(message, routing_key="task.key")

        return res
    
    async def mark_resolved(self, report_id):
        report = await self.repo.get_one_extended(report_id)
        if not report:
            raise HTTPException(
                detail='Report not found', 
                status_code=status.HTTP_404_NOT_FOUND
            )
        res = await self.repo.update_one(report_id, {"status": ReportStatus.RESOLVED})
        await self.video_service.delete_one(report.video.id)

        message_body1 = json.dumps({
            "user_id": report.reporter.id,
            "content": "Видео по вашей жалобе было удалено"
        }).encode()
        message_body2 = json.dumps({
            "user_id": report.video.channel.user.id,
            "content": "Ваше видео было удалено по жалобе пользователя"
        }).encode()
        message1 = aio_pika.Message(
            message_body1,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )
        message2 = aio_pika.Message(
            message_body2,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )
        await self.video_service.rabbit_client.connect()
        exchange = await self.video_service.rabbit_client.channel.get_exchange("tasks_exchange")
        await exchange.publish(message1, routing_key="task.key")
        await exchange.publish(message2, routing_key="task.key")

        return res
    
    async def get_reports(self):
        res = await self.repo.get_all_extended()
        for row in res:
            image = await self.s3_service.get_file_url(row.video.thumbnail_key)
            row.video.image = image
        return res
