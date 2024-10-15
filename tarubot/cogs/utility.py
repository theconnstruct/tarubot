from ..datasource import get_character_by_id
from ..lib.tarubot import TaruBot
from disnake import ApplicationCommandInteraction
from disnake.ext.commands import Cog, slash_command
import logging


class UtilityCommandsCog(Cog):
    def __init__(self, bot):
        self.bot = bot

    @slash_command()
    async def ping(self, interaction: ApplicationCommandInteraction):
        logging.debug(
            "Received ping command from %s as interaction ID %s.",
            interaction.user,
            interaction.id,
        )

        await interaction.send("Pong!", ephemeral=True)

    @slash_command()
    async def test(self, interaction: ApplicationCommandInteraction):
        logging.debug(
            f"Received test command from {interaction.user} as interaction ID {interaction.id}."
        )

        character = await get_character_by_id(1)

        await interaction.send(
            f"Received character ID 1: {character.Name}", ephemeral=True
        )


def setup(bot: TaruBot):
    logging.debug("Loading UtilityCommandsCog...")
    bot.add_cog(UtilityCommandsCog(bot))
    logging.debug("UtilityCommandsCog loaded.")
