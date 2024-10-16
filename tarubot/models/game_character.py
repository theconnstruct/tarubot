from . import Base
from .freecompany import FreeCompany
from .member import Member
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
import datetime


class GameCharacter(Base):
    __tablename__ = "game_character"

    character_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    world: Mapped[str] = mapped_column(String(255), nullable=False)

    member_snowflake: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("member.snowflake", ondelete="CASCADE"), nullable=False
    )

    fc_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("free_company.fc_id", ondelete="SET NULL")
    )

    last_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )

    fc: Mapped["FreeCompany"] = relationship(
        "FreeCompany", back_populates="game_characters"
    )
    member: Mapped["Member"] = relationship("Member", back_populates="game_characters")
