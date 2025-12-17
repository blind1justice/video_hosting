from typing import Annotated
from fastapi import APIRouter, Depends, Query
from api.dependecies import get_current_user, reaction_service
from schemas.user import UserSchemaRead
from services.reaction_service import ReactionService


router = APIRouter(prefix='/api/reactions', tags=['Reactions'])


@router.post('/like')
async def like(
    reaction_service: Annotated[ReactionService, Depends(reaction_service)],
    video_id: int = Query(),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await reaction_service.like(current_user.id, video_id)
    return res


@router.post('/dislike')
async def dislike(
    reaction_service: Annotated[ReactionService, Depends(reaction_service)],
    video_id: int = Query(),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await reaction_service.dislike(current_user.id, video_id)
    return res
