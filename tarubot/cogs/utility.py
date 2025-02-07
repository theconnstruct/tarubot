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


def setup(bot: commands.InteractionBot):
    bot.add_cog(UtilityCommandsCog(bot))
