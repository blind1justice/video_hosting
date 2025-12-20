from schemas.user import RegisterSchema, UserSchemaAdd, LoginSchema
from schemas.user_preferences import UserPreferencesAdd
from services.user_service import UserService
from services.user_preferences_service import UserPreferencesService
from utils.security import get_password_hash, verify_password, create_access_token, verify_token

from fastapi import HTTPException, status



class AuthService:
    def __init__(self, user_service: UserService, user_preferences_service: UserPreferencesService):
        self.user_service = user_service
        self.user_preferences_service = user_preferences_service

    async def register(self, register_data: RegisterSchema):
        if await self.user_service.get_user_by_email(register_data.email):
            raise HTTPException(detail='User with such email already exists', status_code=status.HTTP_400_BAD_REQUEST)
        if register_data.username and await self.user_service.get_user_by_username(register_data.username):
            raise HTTPException(detail='User with such username already exists', status_code=status.HTTP_400_BAD_REQUEST)
        new_user = UserSchemaAdd(
            email=register_data.email,
            hashed_password=get_password_hash(register_data.password),
            username=register_data.username
        )
        user = await self.user_service.add_one(new_user)
        await self.user_preferences_service.add_one(UserPreferencesAdd(user_id=user.id))
        token_data = {
            'sub': str(user.id),
            'email': user.email,
            'username': user.username,
            'role': user.role.value
        }
        access_token = create_access_token(token_data)
        return user, access_token
    
    async def login(self, login_data: LoginSchema):
        user = (
            await self.user_service.get_user_by_email(login_data.login) or
            await self.user_service.get_user_by_username(login_data.login)
        )
        if user is None or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                detail='Wrong login or password', 
                status_code=status.HTTP_400_BAD_REQUEST
            ) 
        token_data = {
            'sub': str(user.id),
            'email': user.email,
            'username': user.username,
            'role': user.role.value
        }
        access_token = create_access_token(token_data)
        return user, access_token
    
    async def check(self, user_id):
        user = await self.user_service.get_one(user_id)
        token_data = {
            'sub': str(user.id),
            'email': user.email,
            'username': user.username,
            'role': user.role.value
        }
        access_token = create_access_token(token_data)
        return user, access_token 
    
    async def verify_access_token(self, access_token):
        payload = verify_token(access_token)
        user_id = int(payload.get('sub'))
        user = await self.user_service.get_user_with_channel(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid authentication credentials',
            )
        return user
    
    async def get_user_with_channel(self, user_id):
        return await self.user_service.get_user_with_channel(user_id)
