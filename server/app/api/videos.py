from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from api.dependecies import video_service, get_current_user_with_channel, get_current_user
from services.video_service import VideoService
from schemas.user import UserSchemaRead


router = APIRouter(prefix='/api/videos', tags=['Videos'])


@router.post('/upload')
async def upload_video(
    video_service: Annotated[VideoService, Depends(video_service)],
    current_user: UserSchemaRead = Depends(get_current_user_with_channel),
    title: str = Form(...),
    description: str = Form(None),
    video_file: UploadFile = File(...),
):
    allowed_video_types = ['video/mp4', 'video/mov', 'video/avi', 'video/x-matroska']

    if video_file.content_type not in allowed_video_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Unsupported video format. Allowed: {", ".join(allowed_video_types)}'
        )

    return await video_service.upload_one(current_user.channel.id, title, video_file.file, video_file.content_type, description)


@router.get('/')
async def get_videos(
    video_service: Annotated[VideoService, Depends(video_service)],
    channel_id: int = Query(None),
):
    return await video_service.get_all_with_channels(channel_id)


@router.get('/{video_id}')
async def get_video_detail(
    video_id: int,
    video_service: Annotated[VideoService, Depends(video_service)],
):
    return await video_service.get_one_with_channel(video_id)
