from services.base import BaseService
from repositories.user_preferences import UserPreferencesRepository


class UserPreferencesService(BaseService):
    repo: UserPreferencesRepository = UserPreferencesRepository()
