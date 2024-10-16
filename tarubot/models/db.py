from . import Base
from os import getenv
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column, relationship, sessionmaker, Session
from typing import List, Optional, Tuple
import datetime
import logging

Base = declarative_base()


async def init_db() -> Tuple[AsyncSession, sessionmaker[Session]]:
    connection_string = (
        getenv("DATABASE_URL")
        .replace("postgresql://", "postgresql+asyncpg://")
        .replace("sslmode", "ssl")
    )

    logging.debug(f"Database URL: {connection_string}")

    engine = create_async_engine(connection_string, echo=True)

    async_session = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    return engine, async_session


class Member(Base):
    __tablename__ = "member"

    snowflake: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    primary_character_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)

    game_characters: Mapped[List["GameCharacter"]] = relationship(
        "GameCharacter", back_populates="member"
    )


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
