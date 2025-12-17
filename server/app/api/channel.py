from typing import Annotated
from fastapi import APIRouter, Depends
from api.dependecies import get_current_user, channel_service, get_current_user_with_channel
from schemas.channel import ChannelAddSchema
from services.channel_service import ChannelService
from schemas.user import UserSchemaRead


router = APIRouter(prefix='/api/channels', tags=['Channel'])


@router.post('/my-channel')
async def create_channel(
    channel: ChannelAddSchema,
    channel_service: Annotated[ChannelService, Depends(channel_service)],
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await channel_service.add_to_user(channel, current_user.id)
    return res


@router.patch('/my-channel')
async def update_channel(
    channel: ChannelAddSchema,
    channel_service: Annotated[ChannelService, Depends(channel_service)],
    current_user: UserSchemaRead = Depends(get_current_user_with_channel) 
):
    res = await channel_service.update_one(current_user.channel.id, channel)
    return res


@router.delete('/my-channel')
async def delete_channel(
    channel_service: Annotated[ChannelService, Depends(channel_service)],
    current_user: UserSchemaRead = Depends(get_current_user_with_channel) 
):
    res = await channel_service.delete_one(current_user.channel.id)
    return res


@router.get('/my-channel/videos')
async def get_with_videos(
    channel_service: Annotated[ChannelService, Depends(channel_service)],
    current_user: UserSchemaRead = Depends(get_current_user_with_channel) 
):
    res = await channel_service.get_one_with_videos(current_user.channel.id)
    return res


@router.get('/{channel_id}/videos')
async def get_channel_with_videos(
    channel_id: int,
    channel_service: Annotated[ChannelService, Depends(channel_service)],
    current_user: UserSchemaRead = Depends(get_current_user) 
):
    res = await channel_service.get_one_with_videos(channel_id)
    return res
