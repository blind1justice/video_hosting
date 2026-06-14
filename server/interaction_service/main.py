from contextlib import asynccontextmanager
import aio_pika
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.rabbit_mq_service import RabbitMQClient
from services.notification_service import NotificationService
from schemas.notification import NotificationSchemaAdd
from api import notification
from middlewares.auth_middleware import InternalAuthMiddleware
import uvicorn
from config.settings import settings
import json

rabbit_client = RabbitMQClient()

async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            body = NotificationSchemaAdd(**json.loads(message.body.decode()))
            notification_service = NotificationService()
            print(body)
            await notification_service.send_notification(body)
            
        except Exception as e:
            print(f"Ошибка обработки сообщения: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await rabbit_client.connect()
    queue = await rabbit_client.channel.declare_queue("task_queue", durable=True)
    
    exchange = await rabbit_client.channel.get_exchange("tasks_exchange")
    await queue.bind(exchange, routing_key="task.key")
    
    await queue.consume(process_message)
    
    yield

    await rabbit_client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(notification.router)
app.add_middleware(InternalAuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def health_check():
    return 'OK'

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8001, reload=True)
