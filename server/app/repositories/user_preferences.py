from repositories.base import BaseRepository
from models.user_preference import UserPreferences


class UserPreferencesRepository(BaseRepository):
    model = UserPreferences
