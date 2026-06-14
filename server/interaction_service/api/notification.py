from typing import Annotated

from fastapi import APIRouter, Depends, Query
from api.dependecies import notification_service
from services.notification_service import NotificationService


router = APIRouter(prefix='/api/notifications', tags=['Notifications'])

@router.get('')
async def get_all_notification(
    user_id: int,
    notification_service: Annotated[NotificationService, Depends(notification_service)],
):
    res = await notification_service.get_user_notification(user_id)
    return res


@router.patch('')
async def mark_all_as_read(
    notification_service: Annotated[NotificationService, Depends(notification_service)],
    user_id: int = Query()
):
    res = await notification_service.mark_all_as_read(user_id)
    return res


@router.patch('/{id}')
async def mark_as_read(
    id: int,
    notification_service: Annotated[NotificationService, Depends(notification_service)],
):
    res = await notification_service.mark_as_read(id)
    return res



