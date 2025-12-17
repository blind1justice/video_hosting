from typing import Annotated
from fastapi import APIRouter, Depends
from api.dependecies import get_current_user, user_service, get_optional_user
from services.user_service import UserService
from schemas.user import UserSchemaRead


router = APIRouter(prefix='/api/users', tags=['Users'])


@router.get("/me")
async def read_users_me(
    current_user: UserSchemaRead = Depends(get_current_user)
):
    return current_user
    

@router.get('/{id}')
async def user(
    id: int,
    video_service: Annotated[UserService, Depends(user_service)],
    current_user: UserSchemaRead = Depends(get_optional_user),
):
    warden_id = current_user.id if current_user else None
    return await video_service.get_user_with_channel(id, warden_id)
