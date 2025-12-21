import enum


class Role(enum.Enum):
    USER = 'USER'
    MODERATOR = 'MODERATOR'
    ADMIN = 'ADMIN'


class VideoStatus(enum.Enum):
    PROCESSING = 'PROCESSING'
    PROCESSED = 'PROCESSED'
    FAILED = 'FAILED'


class ReactionType(enum.Enum):
    LIKE = 'LIKE'
    DISLIKE = 'DISLIKE'


class ReportStatus(enum.Enum):
    PENDING = 'PENDING'
    RESOLVED = 'RESOLVED'
    REJECTED = 'REJECTED'


class AvailableLanguages(enum.Enum):
    RUSSIAN = 'RUSSIAN'
    ENGLISH = 'ENGLISH'
