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

import logging
import os

from disnake.ext import commands


def main():
    test_guild_ids = (
        list(map(int, os.environ.get("DISCORD_GUILD_IDS").split(",")))
        if os.environ.get("DISCORD_GUILD_IDS")
        else None
    )

    bot = commands.InteractionBot(test_guilds=test_guild_ids)

    bot.load_extensions("tarubot/cogs")

    bot.run(os.environ.get("DISCORD_API_TOKEN"))
