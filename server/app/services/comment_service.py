from repositories.comment import CommentRepository
from services.base import BaseService
from fastapi import HTTPException, status


class CommentService(BaseService):
    repo: CommentRepository = CommentRepository()

    async def left_comment(self, user_id, comment_schema):
        if comment_schema.parent_id:
            comment = await self.repo.get_one(comment_schema.parent_id)
            if not comment:
                raise HTTPException(
                    detail='Comment not found', 
                    status_code=status.HTTP_404_NOT_FOUND
                )
            if comment.parent_id:
                raise HTTPException(
                    detail="You can't reply replied comment", 
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        comment_schema = comment_schema.model_dump()
        comment_schema['user_id'] = user_id
        res = await self.repo.add_one(comment_schema)
        return res

    
    async def delete_comment(self, user_id, comment_id):
        comment = await self.repo.get_one(comment_id)
        if not comment:
            raise HTTPException(
                detail='Comment not found', 
                status_code=status.HTTP_404_NOT_FOUND
            )
        if comment.user_id != user_id:
            raise HTTPException(
                detail="It's not your comment", 
                status_code=status.HTTP_400_BAD_REQUEST
            )
        res = await self.repo.delete_one(comment_id)
        return res
    
    async def edit_comment(self, user_id, comment_id, comment_schema):
        comment = await self.repo.get_one(comment_id)
        if not comment:
            raise HTTPException(
                detail='Comment not found', 
                status_code=status.HTTP_404_NOT_FOUND
            )
        if comment.user_id != user_id:
            raise HTTPException(
                detail="It's not your comment", 
                status_code=status.HTTP_400_BAD_REQUEST
            )
        comment_schema = comment_schema.model_dump(exclude_unset=True)
        comment_schema['is_edited'] = True
        res = await self.repo.update_one(comment_id, comment_schema)
        return res
    
    async def get_all_comments_for_video(self, video_id, user_id):
        res = await self.repo.get_all_for_video(video_id, user_id)
        return res
    
    async def get_all_comments_for_comment(self, comment_id, user_id):
        res = await self.repo.get_all_for_comment(comment_id, user_id)
        return res
