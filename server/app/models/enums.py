import enum


class Role(enum.Enum):
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'


class VideoStatus(enum.Enum):
    PROCESSING = 'processing'
    PROCESSED = 'processed'
    FAILED = 'failed'
