from aio_pika import connect_robust
from config.settings import settings


class RabbitMQClient:
    def __init__(self):
        self.rabbitmq_url = settings.rabbitmq_url
        self.connection = None
        self.channel = None
        
    async def connect(self):
        self.connection = await connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        
    async def close(self):
        if self.connection:
            await self.connection.close()
