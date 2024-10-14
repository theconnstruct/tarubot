from typing import List
from disnake.ext.commands import InteractionBot
from sqlalchemy.ext.asyncio import AsyncSession


class TaruBot(InteractionBot):
    def __init__(
        self, guild_id: List[int] | None, db_session: AsyncSession, *args, **kwargs
    ):
        self.db_session = db_session

        super().__init__(test_guilds=[guild_id] if guild_id else None, *args, **kwargs)
