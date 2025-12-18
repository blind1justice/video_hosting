from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from api.dependecies import get_current_user, comment_service, get_optional_user
from schemas.user import UserSchemaRead
from schemas.comment import CommentSchemaAdd, CommentSchemaEdit
from services.comment_service import CommentService


router = APIRouter(prefix='/api/comments', tags=['Comments'])


@router.post('')
async def comment(
    comment_service: Annotated[CommentService, Depends(comment_service)],
    comment: CommentSchemaAdd,
    current_user: UserSchemaRead = Depends(get_current_user)
):  
    res = await comment_service.left_comment(current_user.id, comment)
    return res
    

@router.delete('/{comment_id}')
async def delete_comment(
    comment_service: Annotated[CommentService, Depends(comment_service)],
    comment_id: int,
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await comment_service.delete_comment(current_user.id, comment_id)
    return res


@router.patch('/{comment_id}')
async def edit_comment(
    comment_service: Annotated[CommentService, Depends(comment_service)],
    comment_id: int,
    comment: CommentSchemaEdit,
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await comment_service.edit_comment(current_user.id, comment_id, comment)
    return res


@router.get('')
async def get_all_comments(
    comment_service: Annotated[CommentService, Depends(comment_service)],
    current_user: UserSchemaRead = Depends(get_optional_user),
    video_id: int = Query(None),
    comment_id: int = Query(None),
):
    user_id = current_user.id if current_user else None
    if (video_id is None and comment_id is None) or (video_id is not None and comment_id is not None):
        raise HTTPException(
            detail="You must provide either video_id or comment_id, not both",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    if video_id:
        res = await comment_service.get_all_comments_for_video(video_id, user_id)
    elif comment_id:
        res = await comment_service.get_all_comments_for_comment(comment_id, user_id)
    return res
