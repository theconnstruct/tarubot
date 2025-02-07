#  Copyright (C) 2025 Connor Maddox
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program. If not, see <https://www.gnu.org/licenses/>.


from tarubot.lib import TaruBot
from typing import Optional, cast
import os

"""
Module: tarubot.main
--------------------
Description:
    This module initializes and launches TaruBot using the disnake library.
    It retrieves testing guild IDs and the Discord API token from environment variables,
    sets up the bot with its extensions, and starts the bot.
Environment Variables:
    DISCORD_GUILD_IDS:
        An optional, comma-separated list of guild IDs for testing purposes.
        If present, these are converted to a list of integers.
    DISCORD_API_TOKEN:
        The API token used for authenticating and running the Discord bot.
Functions:
    main():
        Main entry point for the application.
        Process:
            - Reads the "DISCORD_GUILD_IDS" environment variable; if set, splits the string by commas,
              converts each value to an integer, and assigns the resulting list to `test_guild_ids`.
            - Creates an instance of TaruBot, optionally associating it with test guilds.
            - Loads the bot's extensions from the "tarubot/cogs" directory.
            - Starts the bot using the API token provided in the "DISCORD_API_TOKEN" environment variable.
        Note:
            The function expects the necessary environment variables to be correctly set.
"""


def main() -> None:
    test_guild_ids: Optional[list[int]] = (
        list(map(int, cast(str, os.environ.get("DISCORD_GUILD_IDS")).split(",")))
        if os.environ.get("DISCORD_GUILD_IDS")
        else None
    )

    bot = TaruBot(test_guilds=test_guild_ids)
    bot.load_extensions("tarubot/cogs")

    bot.run(os.environ.get("DISCORD_API_TOKEN"))
