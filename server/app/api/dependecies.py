from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from models.enums import Role
from services.reaction_service import ReactionService
from services.video_processor_service import VideoProcessorService
from services.s3_service import S3Service
from services.auth_service import AuthService
from services.user_service import UserService
from services.video_service import VideoService
from services.channel_service import ChannelService
from services.subscription_service import SubscriptionService
from fastapi.security import OAuth2PasswordBearer
from schemas.user import UserSchemaRead


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login-form')


def reaction_service():
    return ReactionService()


def subscription_service():
    return SubscriptionService()


def user_service():
    return UserService()


def auth_service():
    user_service = UserService()
    return AuthService(user_service)


def channel_service():
    return ChannelService()


def video_service():
    s3_service = S3Service()
    video_processor_service = VideoProcessorService()
    return VideoService(s3_service, video_processor_service)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(auth_service)
):
    return await auth_service.verify_access_token(token)


async def get_optional_user(
    token: Optional[str] = None,
    auth_service: AuthService = Depends(auth_service),
    request: Request = None
):
    authorization = request.headers.get("Authorization") if request else None
    
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization[7:]
    
    try:
        return await auth_service.verify_access_token(token)
    except HTTPException:
        return None


async def get_current_user_with_channel(
    current_user: UserSchemaRead = Depends(get_current_user)
):
    if current_user.channel is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You should have the channel'
        )
    return current_user


async def get_current_admin(
    current_user: UserSchemaRead = Depends(get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin access required'
        )
    return current_user