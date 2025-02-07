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

import disnake
from disnake.ext import commands

from tarubot.lib import nodestone


class UtilityCommandsCog(commands.Cog):
    def __init__(self, bot: commands.InteractionBot):
        super().__init__()
        self.bot = bot

    @commands.slash_command(description="Check bot alive status and latency.")
    async def ping(self, interaction: disnake.ApplicationCommandInteraction):
        await interaction.send(
                "Pong! Current websocket latency is {} milliseconds.".format(
                        int(self.bot.latency * 1000)
                ),
                ephemeral=True,
        )

    @commands.slash_command(description="Test nodestone worker connectivity.")
    async def test(self, interaction: disnake.ApplicationCommandInteraction, character_id: int):
        character_data = await nodestone.get_character_by_id(character_id)
        if not character_data:
            await interaction.send("No character found with that ID.", ephemeral=True)
        else:
            await interaction.send(
                    "```json\nFound character {} on {}.\n```".format(character_data['Name'],
                                                                     character_data['World']
                                                                     )
            )

    @commands.slash_command(description="View the source code for this bot.")
    async def source(self, interaction: disnake.ApplicationCommandInteraction):
        await interaction.send("The source code for this bot can be viewed at "
                               "https://github.com/theconnstruct/tarubot.\nThe source code is licensed under the GNU "
                               "Affero General Public License 3.0.", ephemeral=True)


def setup(bot: commands.InteractionBot):
    bot.add_cog(UtilityCommandsCog(bot))
