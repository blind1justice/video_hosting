from models.base import Base
from models.enums import AvailableLanguages
from schemas.user_preferences import UserPreferencesRead

from sqlalchemy import ForeignKey, Integer, Boolean, text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship


class UserPreferences(Base):
    __tablename__ = 'user_preferences'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    autoplay: Mapped[bool] = mapped_column(Boolean, server_default=text('false'))
    language: Mapped[AvailableLanguages] = mapped_column(Enum(AvailableLanguages), server_default=AvailableLanguages.RUSSIAN.name)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, server_default=text('true'))

    user = relationship('User', back_populates='user_preferences')

    def to_read_model(self):
        return UserPreferencesRead.model_validate(self)
