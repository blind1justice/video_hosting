from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from api.dependecies import get_current_user, reaction_service
from schemas.user import UserSchemaRead
from services.reaction_service import ReactionService


router = APIRouter(prefix='/api/reactions', tags=['Reactions'])


@router.post('/like')
async def like(
    reaction_service: Annotated[ReactionService, Depends(reaction_service)],
    video_id: int = Query(None),
    comment_id: int = Query(None),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    if (video_id is None and comment_id is None) or (video_id is not None and comment_id is not None):
        raise HTTPException(
            detail="You must provide either video_id or comment_id, not both",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    if video_id is not None:
        res = await reaction_service.like_on_video(current_user.id, video_id)
    elif comment_id is not None:
        res = await reaction_service.like_on_comment(current_user.id, comment_id)
    return res


@router.post('/dislike')
async def dislike(
    reaction_service: Annotated[ReactionService, Depends(reaction_service)],
    video_id: int = Query(None),
    comment_id: int = Query(None),
    current_user: UserSchemaRead = Depends(get_current_user)
):
    if (video_id is None and comment_id is None) or (video_id is not None and comment_id is not None):
        raise HTTPException(
            detail="You must provide either video_id or comment_id, not both",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    if video_id is not None:
        res = await reaction_service.dislike_on_video(current_user.id, video_id)
    elif comment_id is not None:
        res = await reaction_service.dislike_on_comment(current_user.id, comment_id)
    return res
