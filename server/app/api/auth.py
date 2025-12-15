from typing import Annotated
from fastapi import APIRouter, Depends, Form

from schemas.user import RegisterSchema, LoginSchema, UserSchemaRead
from services.auth_service import AuthService
from api.dependecies import auth_service, get_current_user

router = APIRouter(prefix='/api/auth', tags=['Auth'])


@router.post('/register')
async def register(
    user: RegisterSchema, 
    auth_service: Annotated[AuthService, Depends(auth_service)]
):
    user, token = await auth_service.register(user)
    return {
        'user': user,
        'token': token
    }


@router.post('/login')
async def login(
    user: LoginSchema,
    auth_service: Annotated[AuthService, Depends(auth_service)]
):
    user, token = await auth_service.login(user)
    return {
        'user': user,
        'token': token
    }


@router.post('/check')
async def check(
    auth_service: Annotated[AuthService, Depends(auth_service)],
    current_user: UserSchemaRead = Depends(get_current_user)
):
    user, token = await auth_service.check(current_user.id)
    return {
        'user': user,
        'token': token
    }


@router.post('/login-form')
async def login_form(
    auth_service: Annotated[AuthService, Depends(auth_service)],
    username: str = Form(...),
    password: str = Form(...),
):
    login_data = LoginSchema(login=username, password=password)
    _, token = await auth_service.login(login_data)
    return {
        'access_token': token,
        'token_type': 'bearer'
    }
