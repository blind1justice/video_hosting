from typing import Annotated
from fastapi import APIRouter, Depends, Query
from api.dependecies import get_current_user, subscription_service
from schemas.subscription import SubscriptionSchemaAdd
from schemas.user import UserSchemaRead
from services.subscription_service import SubscriptionService


router = APIRouter(prefix='/api/subscriptions', tags=['Subscriptions'])


@router.post('/')
async def subscribe(
    subscription_service: Annotated[SubscriptionService, Depends(subscription_service)],
    channel_id: int = Query(),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await subscription_service.subscribe(current_user.id, channel_id)
    return res


@router.delete('/')
async def unsubscribe(
    subscription_service: Annotated[SubscriptionService, Depends(subscription_service)],
    channel_id: int = Query(),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await subscription_service.unsubscribe(current_user.id, channel_id)
    return res
