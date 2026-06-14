from contextlib import asynccontextmanager
from aio_pika import ExchangeType
import aio_pika
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config.settings import settings
from api import channel, user, video, auth, subscription, reaction, comment, report, user_preferences, notifications
from services.rabbit_mq_service import RabbitMQClient

rabbit_client = RabbitMQClient()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await rabbit_client.connect()
    await rabbit_client.channel.declare_queue("task_queue", durable=True)
    await rabbit_client.channel.declare_exchange(
        "tasks_exchange", 
        ExchangeType.DIRECT,
        durable=True
    )
    yield
    await rabbit_client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(channel.router)
app.include_router(video.router)
app.include_router(subscription.router)
app.include_router(reaction.router)
app.include_router(comment.router)
app.include_router(report.router)
app.include_router(user_preferences.router)
app.include_router(notifications.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def health_check():
    try:
        import json
        message_body = json.dumps({"user_id": 1, "content": "qwe"}).encode()
        
        message = aio_pika.Message(
            message_body,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        )
        
        exchange = await rabbit_client.channel.get_exchange("tasks_exchange")
        await exchange.publish(message, routing_key="task.key")
        
        return {"status": "sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
