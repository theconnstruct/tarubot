from . import Base
from .game_character import GameCharacter
from sqlalchemy import BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional


class Member(Base):
    __tablename__ = "member"

    snowflake: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    primary_character_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)

    game_characters: Mapped[List["GameCharacter"]] = relationship(
        "GameCharacter", back_populates="member"
    )
