from repositories.notification import NotificationRepository
from services.base import BaseService

from schemas.notification import NotificationSchemaAdd


class NotificationService(BaseService):
    repo: NotificationRepository = NotificationRepository()

    async def send_notification(self, notification: NotificationSchemaAdd):
        item_id = await self.add_one(notification)
        return item_id
    
    async def get_user_notification(self, user_id: int):
        res = await self.repo.get_user_notifications(user_id)
        return res
    
    async def mark_as_read(self, id: int):
        item_id = await self.repo.update_one(id, {"is_read": True})
        return item_id
    
    async def mark_all_as_read(self, user_id: int):
        res = await self.repo.mark_all_as_read(user_id)
        return res
