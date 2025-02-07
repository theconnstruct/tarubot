import json

import disnake
import requests
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

    @commands.slash_command(description="Test nodestone worker connectivity.")
    async def test(self, interaction: disnake.ApplicationCommandInteraction):
        s = requests.session()
        r = s.get('http://nodestone:8080/Character/38371223')
        await interaction.send("```json\n{}\n```".format(
                json.dumps(r.json(), indent=2))
        )


def setup(bot: commands.InteractionBot):
    bot.add_cog(UtilityCommandsCog(bot))
