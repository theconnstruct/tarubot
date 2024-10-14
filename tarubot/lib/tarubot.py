from typing import List
from disnake.ext.commands import InteractionBot


class TaruBot(InteractionBot):
    def __init__(self, guild_id: List[int] | None, *args, **kwargs):
        super().__init__(test_guilds=[guild_id] if guild_id else None, *args, **kwargs)
