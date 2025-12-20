from typing import Annotated
from fastapi import APIRouter, Depends
from api.dependecies import get_current_user, user_preferences_service
from services.user_preferences_service import UserPreferencesService
from schemas.user_preferences import UserPreferencesUpdate
from schemas.user import UserSchemaRead


router = APIRouter(prefix='/api/user-preferences', tags=['UserPreferences'])


@router.patch('/')
async def change_preferences(
    user_preferences: UserPreferencesUpdate,
    user_preferences_service: Annotated[UserPreferencesService, Depends(user_preferences_service)],
    current_user: UserSchemaRead = Depends(get_current_user) 
):
    res = await user_preferences_service.update_one(current_user.user_preferences.id, user_preferences)
    return res
