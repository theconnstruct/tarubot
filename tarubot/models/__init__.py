from os import getenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

Base = declarative_base()

from .member import Member
from .game_character import GameCharacter


async def init_db():
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
