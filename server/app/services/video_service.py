import uuid
from fastapi import HTTPException, status
from models.enums import VideoStatus
from services.s3_service import S3Service
from services.video_processor_service import VideoProcessorService
from repositories.video import VideoRepository
from services.base import BaseService
from schemas.video import VideoUploadSchema



class VideoService(BaseService):
    repo: VideoRepository = VideoRepository()
    
    def __init__(self, s3_service: S3Service, video_processor_service: VideoProcessorService):
        self.s3_service = s3_service
        self.video_processor_service = video_processor_service

    async def delete_from_channel(self, channel_id, video_id, is_moderator=False):
        video = await self.repo.get_one(video_id)
        if not video:
            raise HTTPException(
                detail='Video not found',
                status_code=status.HTTP_404_NOT_FOUND
            )
        if video.channel_id != channel_id and not is_moderator:
             raise HTTPException(
                detail="It's not your video", 
                status_code=status.HTTP_400_BAD_REQUEST
            )
        res = await self.repo.delete_one(video_id)
        return res

    async def upload_one(self, channel_id, title, video, original_format, description=None):
        storage_key = f'videos/{uuid.uuid4()}_{title}'
        thumbnail_key = f'thumbnails/{uuid.uuid4()}_{title}.jpg'
        video_data = VideoUploadSchema(
            channel_id=channel_id,
            title=title,
            description=description,
            storage_key=storage_key,
            original_format=original_format,
            thumbnail_key=thumbnail_key
        )
        new_video = await self.repo.add_one(video_data.model_dump())
        await self.s3_service.upload_file(video, storage_key)

        thumbnail_data = await self.video_processor_service.extract_first_frame(video, original_format)

        duration = await self.video_processor_service.get_video_duration(video, original_format)

        if thumbnail_data:
            await self.s3_service.upload_file(thumbnail_data, thumbnail_key)

        await self.repo.update_one(new_video.id, {
            "duration": duration,
            "status": VideoStatus.PROCESSED
        })

        return new_video

    async def get_all_with_channels(self, channel_id=None):
        videos = await self.repo.get_all_with_channels(channel_id)
        for video in videos:
            image = await self.s3_service.get_file_url(video.thumbnail_key)
            video.image = image
        return videos

    async def get_one_with_channel(self, video_id, user_id):
        video = await self.repo.get_one_with_channel(video_id, user_id)
        video_file = await self.s3_service.get_file_url(video.storage_key)
        video.video_file = video_file
        return video
