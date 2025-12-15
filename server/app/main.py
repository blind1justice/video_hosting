from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api import auth, users, channels, videos
from config.settings import settings


app = FastAPI()
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(channels.router)
app.include_router(videos.router)


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
