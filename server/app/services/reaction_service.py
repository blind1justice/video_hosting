from repositories.reaction import ReactionRepository
from services.base import BaseService
from schemas.reaction import ReactionSchemaAdd
from models.enums import ReactionType


class ReactionService(BaseService):
    repo: ReactionRepository = ReactionRepository()

    async def like_on_video(self, user_id, video_id):
        existing_reaction = await self.repo.get_by_user_and_video(user_id, video_id)
        if not existing_reaction:
            reaction_schema = ReactionSchemaAdd(user_id=user_id, video_id=video_id, type=ReactionType.LIKE.value)
            res = await self.repo.add_one(reaction_schema.model_dump())
            return res
        if existing_reaction.type == ReactionType.LIKE:
            res = await self.repo.delete_one(existing_reaction.id)
            return res
        if existing_reaction.type == ReactionType.DISLIKE:
            res = await self.repo.update_one(existing_reaction.id, {"type": ReactionType.LIKE})
            return res
    
    async def dislike_on_video(self, user_id, video_id):
        existing_reaction = await self.repo.get_by_user_and_video(user_id, video_id)
        if not existing_reaction:
            reaction_schema = ReactionSchemaAdd(user_id=user_id, video_id=video_id, type=ReactionType.DISLIKE.value)
            res = await self.repo.add_one(reaction_schema.model_dump())
            return res
        if existing_reaction.type == ReactionType.DISLIKE:
            res = await self.repo.delete_one(existing_reaction.id)
            return res
        if existing_reaction.type == ReactionType.LIKE:
            res = await self.repo.update_one(existing_reaction.id, {"type": ReactionType.DISLIKE})
            return res
        
    async def like_on_comment(self, user_id, comment_id):
        existing_reaction = await self.repo.get_by_user_and_comment(user_id, comment_id)
        if not existing_reaction:
            reaction_schema = ReactionSchemaAdd(user_id=user_id, comment_id=comment_id, type=ReactionType.LIKE.value)
            res = await self.repo.add_one(reaction_schema.model_dump())
            return res
        if existing_reaction.type == ReactionType.LIKE:
            res = await self.repo.delete_one(existing_reaction.id)
            return res
        if existing_reaction.type == ReactionType.DISLIKE:
            res = await self.repo.update_one(existing_reaction.id, {"type": ReactionType.LIKE})
            return res
    
    async def dislike_on_comment(self, user_id, comment_id):
        existing_reaction = await self.repo.get_by_user_and_comment(user_id, comment_id)
        if not existing_reaction:
            reaction_schema = ReactionSchemaAdd(user_id=user_id, comment_id=comment_id, type=ReactionType.DISLIKE.value)
            res = await self.repo.add_one(reaction_schema.model_dump())
            return res
        if existing_reaction.type == ReactionType.DISLIKE:
            res = await self.repo.delete_one(existing_reaction.id)
            return res
        if existing_reaction.type == ReactionType.LIKE:
            res = await self.repo.update_one(existing_reaction.id, {"type": ReactionType.DISLIKE})
            return res
