from fastapi import APIRouter, Depends
import aiohttp
from api.dependecies import get_current_user
from schemas.user import UserSchemaRead
from config.settings import settings 


router = APIRouter(prefix='/api/notifications', tags=['Notifications'])
headers = {"X-Internal-Token": settings.internal_api_key}

@router.get('/read')
async def read_notifications(
    current_user: UserSchemaRead = Depends(get_current_user)
):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f'{settings.interaction_service_url}/api/notifications?user_id={current_user.id}',
            headers=headers
        ) as res:
            return await res.json()


@router.patch('/mark-as-read/all')
async def mark_all_notification_as_read(
    current_user: UserSchemaRead = Depends(get_current_user)
):
    async with aiohttp.ClientSession() as session:
        async with session.patch(
            f'{settings.interaction_service_url}/api/notifications?user_id={current_user.id}',
            headers=headers
        ) as res:
            return await res.json()


@router.patch('/mark-as-read/{id}')
async def mark_as_read(
    id: int,
    current_user: UserSchemaRead = Depends(get_current_user),
):
    async with aiohttp.ClientSession() as session:
        async with session.patch(
            f'{settings.interaction_service_url}/api/notifications/{id}',
            headers=headers
        ) as res:
            return await res.json()
