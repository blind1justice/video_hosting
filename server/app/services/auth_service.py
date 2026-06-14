from pydantic import EmailStr

from schemas.user import RegisterSchema, UserSchemaAdd, LoginSchema, VerifySchema
from schemas.user_preferences import UserPreferencesAdd
from services.user_service import UserService
from services.user_preferences_service import UserPreferencesService
from services.email_service import EmailService
from utils.security import get_password_hash, verify_password, create_access_token, verify_token

from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone
import secrets


class AuthService:
    def __init__(
            self,
            user_service: UserService,
            user_preferences_service: UserPreferencesService,
            email_service: EmailService
        ):
        self.user_service = user_service
        self.user_preferences_service = user_preferences_service
        self.email_service = email_service

    async def register(self, register_data: RegisterSchema):
        existing_user = await self.user_service.get_user_by_email(register_data.email)
        if existing_user and existing_user.is_confirmed:
            raise HTTPException(detail='User with such email already exists', status_code=status.HTTP_400_BAD_REQUEST)
        optional_user = await self.user_service.get_user_by_username(register_data.username)
        if register_data.username and optional_user and optional_user.is_confirmed:
            raise HTTPException(detail='User with such username already exists', status_code=status.HTTP_400_BAD_REQUEST)
        confirmation_token = ''.join(secrets.choice('0123456789') for _ in range(6))
        if not existing_user:
            new_user = UserSchemaAdd(
                email=register_data.email,
                hashed_password=get_password_hash(register_data.password),
                username=register_data.username,
                email_confirmation_code=confirmation_token,
                email_confirmation_sent_at=datetime.now()
            )
            user = await self.user_service.add_one(new_user)
            await self.user_preferences_service.add_one(UserPreferencesAdd(user_id=user.id))
        else:
            existing_user.email_confirmation_code = confirmation_token
            existing_user.email_confirmation_sent_at = datetime.now()
            existing_user.username = register_data.username
            await self.user_service.update_one(existing_user.id, existing_user)
        await self.email_service.send_email_async(
            to_emails=[register_data.email],
            subject='Account verification',
            body=f'''
Hello! This is your confirmation code to complete registration: {confirmation_token}.
The code is valid for 10 minutes
'''
        )
        return None
    
    async def confirm_account(self, user: VerifySchema):
        user = await self.user_service.get_user_by_confirmation_code(user.email, user.confirmation_code)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid confirmation code"
            )
        
        if user.email_confirmation_sent_at:
            code_expiry = user.email_confirmation_sent_at + timedelta(minutes=10)
            if datetime.now(timezone.utc) > code_expiry:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Confirmation code expired"
                )
            user = await self.user_service.confirm_email(user.id)
            token_data = {
                'sub': str(user.id),
                'email': user.email,
                'username': user.username,
                'role': user.role.value
            }
            access_token = create_access_token(token_data)
            return user, access_token
        
        raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Confirmation error"
            )
    
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
        if user and not user.is_confirmed:
            raise HTTPException(
                detail='You need to verify your account firsly', 
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
