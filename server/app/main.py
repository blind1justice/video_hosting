from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config.settings import settings
from api import channel, user, video, auth, subscription, reaction


app = FastAPI()
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(channel.router)
app.include_router(video.router)
app.include_router(subscription.router)
app.include_router(reaction.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def health_check():
    return 'OK'

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
