from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    db_user: str = 'interaction_service_db'
    db_password: str = 'interaction_service_db'
    db_name: str = 'interaction_service_db'
    db_host: str = 'localhost'
    db_port: int = 5435

    jwt_secret_key: str
    jwt_algorithm: str = 'HS256'
    jwt_access_token_expire_minutes: int = 60 * 3

    origins: List[str] = [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:80',
    ]

    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_login: str = "admin"
    rabbitmq_password: str = "admin123"
    rabbitmq_vhost: str = "/"

    internal_api_key: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:"
            f"{self.db_password}@{self.db_host}:"
            f"{self.db_port}/{self.db_name}"
        )
    
    @property
    def rabbitmq_url(self) -> str:
        return (
            f"amqp://{self.rabbitmq_login}:"
            f"{self.rabbitmq_password}@{self.rabbitmq_host}:"
            f"{self.rabbitmq_port}/{self.rabbitmq_vhost}"
        )
    
    class Config:
        env_file = ".env" 
    

settings = Settings()
