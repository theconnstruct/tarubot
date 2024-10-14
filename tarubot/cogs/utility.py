from ..lib.tarubot import TaruBot
from disnake import ApplicationCommandInteraction
from disnake.ext.commands import Cog, slash_command
import logging


class UtilityCommandsCog(Cog):
    def __init__(self, bot):
        self.bot = bot

    @slash_command()
    async def ping(self, interaction: ApplicationCommandInteraction):
        await interaction.send("Pong!")


def setup(bot: TaruBot):
    logging.debug("Loading UtilityCommandsCog...")
    bot.add_cog(UtilityCommandsCog(bot))
    logging.debug("UtilityCommandsCog loaded.")
