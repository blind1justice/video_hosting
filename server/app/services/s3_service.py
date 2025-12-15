from contextlib import asynccontextmanager
from aiobotocore.session import get_session
from config.settings import settings


class S3Service:
    def __init__(self):
        self.config = {
            'aws_access_key_id': settings.minio_access_key,
            'aws_secret_access_key': settings.minio_secret_key,
            'endpoint_url': settings.minio_endpoint
        }
        self.bucket_name = settings.minio_bucket_name
        self.session = get_session()

    @asynccontextmanager
    async def get_client(self):
        async with self.session.create_client('s3', **self.config) as client:
            yield client

    async def upload_file(self, file_data, object_name):
        async with self.get_client() as client:
            await client.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=file_data
            )

    async def get_file_url(self, object_name, expires = 3600):
        async with self.get_client() as client:
            return await client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expires
            )
        