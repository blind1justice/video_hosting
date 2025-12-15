from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    db_user: str = 'video_hosting_db'
    db_password: str = 'video_hosting_db'
    db_name: str = 'video_hosting_db'
    db_host: str = 'localhost'
    db_port: int = 5434

    jwt_secret_key: str
    jwt_algorithm: str = 'HS256'
    jwt_access_token_expire_minutes: int = 30

    minio_endpoint: str = 'http://localhost:9000'
    minio_access_key: str = 'minioadmin'
    minio_secret_key: str = 'minioadmin'
    minio_bucket_name: str = 'video-hosting'

    origins: List[str] = ['http://localhost:3000']

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:"
            f"{self.db_password}@{self.db_host}:"
            f"{self.db_port}/{self.db_name}"
        )
    
    class Config:
        env_file = ".env" 
    

settings = Settings()
