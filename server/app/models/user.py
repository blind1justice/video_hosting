from models.base import Base
from models.enums import Role

from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(length=100), unique=True)
    username: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(length=100))
    avatar_url: Mapped[str | None] = mapped_column(String(length=255), nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.USER)

    channel = relationship('Channel', uselist=False, back_populates='user')
    subscriptions = relationship('Subscription', back_populates='subscriber')
    reactions = relationship('Reaction', back_populates='user')

    def to_read_model(self):
        from schemas.user import UserSchemaWithouChannelRead
        return UserSchemaWithouChannelRead.model_validate(self)

    def to_read_model_with_channel(self):
        from schemas.user import UserSchemaRead
        return UserSchemaRead.model_validate(self)
