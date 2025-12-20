import enum


class Role(enum.Enum):
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'


class VideoStatus(enum.Enum):
    PROCESSING = 'processing'
    PROCESSED = 'processed'
    FAILED = 'failed'


class ReactionType(enum.Enum):
    LIKE = 'like'
    DISLIKE = 'dislike'


class ReportStatus(enum.Enum):
    PENDING = 'pending'
    RESOLVED = 'resolved'
    REJECTED = 'rejected'


class AvailableLanguages(enum.Enum):
    RUSSIAN = 'russian'
    ENGLISH = 'english'
