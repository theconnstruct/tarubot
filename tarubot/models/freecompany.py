from . import Base
from .game_character import GameCharacter
from sqlalchemy import BigInteger, DateTime, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import datetime


class FreeCompany(Base):
    __tablename__ = "free_company"

    fc_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fc_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    last_updated: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, server_default=text("CURRENT_TIMESTAMP")
    )

    game_characters: Mapped[List["GameCharacter"]] = relationship(
        "GameCharacter", back_populates="fc"
    )
