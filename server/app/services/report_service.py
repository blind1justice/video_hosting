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
        report_schema = report_schema.model_dump()
        report_schema['reporter_id'] = user_id
        res = await self.repo.add_one(report_schema)
        return res

    async def mark_rejected(self, report_id):
        res = await self.repo.update_one(report_id, {"status": ReportStatus.REJECTED})
        return res
    
    async def mark_resolved(self, report_id):
        report = await self.repo.get_one(report_id)
        if not report:
            raise HTTPException(
                detail='Report not found', 
                status_code=status.HTTP_404_NOT_FOUND
            )
        res = await self.repo.update_one(report_id, {"status": ReportStatus.RESOLVED})
        await self.video_service.delete_one(report.video_id)
        return res
    
    async def get_reports(self):
        res = await self.repo.get_all_extended()
        for row in res:
            image = await self.s3_service.get_file_url(row.video.thumbnail_key)
            row.video.image = image
        return res
