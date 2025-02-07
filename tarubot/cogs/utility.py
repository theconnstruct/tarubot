import disnake
from disnake.ext import commands


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


def setup(bot: commands.InteractionBot):
    bot.add_cog(UtilityCommandsCog(bot))
