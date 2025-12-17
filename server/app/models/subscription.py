from models.base import Base

from sqlalchemy import UniqueConstraint, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from schemas.subscription import SubscriptionSchemaRead


class Subscription(Base):
    __tablename__ = 'subscriptions'

    __table_args__ = (
        UniqueConstraint('subscriber_id', 'channel_id', name='uq_subscriber_channel'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    subscriber_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    channel_id: Mapped[int] = mapped_column(Integer, ForeignKey('channels.id', ondelete='CASCADE'))

    subscriber = relationship('User', back_populates='subscriptions')
    channel = relationship('Channel', back_populates='subscriptions')

    def to_read_model(self):
        return SubscriptionSchemaRead.model_validate(self)
    