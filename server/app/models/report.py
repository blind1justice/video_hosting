from models.base import Base
from models.enums import ReportStatus
from sqlalchemy import CheckConstraint, Text, Column, Enum, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from schemas.report import ReportSchemaRead


class Report(Base):
    __tablename__ = 'reports'

    __table_args__ = (
        UniqueConstraint('reporter_id', 'video_id', name='uq_reporter_video'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    reporter_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    video_id: Mapped[int] = mapped_column(Integer, ForeignKey('videos.id', ondelete='CASCADE'))
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus), server_default=ReportStatus.PENDING.name)

    reporter = relationship('User', back_populates='reports')
    video = relationship('Video', back_populates='reports')

    def to_read_model(self):
        return ReportSchemaRead.model_validate(self)
