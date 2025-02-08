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


from disnake.ext import commands
from tarubot.lib import nodestone, TaruBot
import disnake


class UtilityCommandsCog(commands.Cog):
    """
    UtilityCommandsCog is a cog that provides utility commands for TaruBot.
    Attributes:
        bot (TaruBot): The bot instance used to handle interactions and commands.
    Commands:
        ping:
            Checks the bot's connection by sending a "Pong!" message along with the current websocket latency in milliseconds.
            The response is sent as an ephemeral message visible only to the user who invoked the command.
        test(character_id: int):
            Tests connectivity with the Nodestone worker by attempting to retrieve character data using the provided character ID.
            If character data is found, it sends back the character's name and world in a formatted message.
            If no data is found, it notifies the user with an ephemeral message indicating that no character was found.
        version:
            Provides version, source code, and licensing information for TaruBot along with details about its integrated services.
            This command returns a formatted message including:
                - The current version of TaruBot and a note on its early, unstable development status.
                - A link to the source code repository on GitHub.
                - Licensing details under the GNU Affero General Public License 3.0.
                - Information about the Nodestone project used for Lodestone interactions.
            The response is sent as an ephemeral message.
    """

    def __init__(self, bot: TaruBot):
        """
        Initializes the cog with the provided TaruBot.
        Args:
            bot (TaruBot): An instance responsible for handling interactions and commands.
        This constructor initializes the parent class and sets up the cog with the necessary bot context.
        """

        super().__init__()
        self.bot = bot

    @commands.slash_command(description="Check bot alive status and latency.")
    async def ping(self, interaction: disnake.ApplicationCommandInteraction):
        """
        Sends a response to the user with the current websocket latency.
        This command replies "Pong!" followed by the websocket latency in milliseconds.
        The message is sent as ephemeral, which means it is only visible to the user who invoked the command.
        Parameters:
            interaction (disnake.ApplicationCommandInteraction): The interaction object representing the command invocation.
        """

        await interaction.send(
            "Pong! Current websocket latency is {} milliseconds.".format(
                int(self.bot.latency * 1000)
            ),
            ephemeral=True,
        )

    @commands.slash_command(description="Test nodestone worker connectivity.")
    async def test(
        self, interaction: disnake.ApplicationCommandInteraction, character_id: int
    ):
        """
        Asynchronously retrieves and displays character data based on a given character ID.
        This function uses the Nodestone API to fetch information about a character. If the character is found, it sends
        a formatted message displaying the character's name and world. If not, it sends an ephemeral message indicating that
        no character was found.
        Parameters:
            interaction (disnake.ApplicationCommandInteraction): The interaction context for sending responses.
            character_id (int): The identifier for the character whose data is to be retrieved.
        Returns:
            None
        """

        character_data = await nodestone.get_character_by_id(character_id)

        if not character_data:
            await interaction.send("No character found with that ID.", ephemeral=True)
        else:
            await interaction.send(
                "```json\nFound character {} on {}.\n```".format(
                    character_data["Name"], character_data["World"]
                )
            )

    @commands.slash_command(
        description="View version, source code, and license information for this bot and integrated services."
    )
    async def version(self, interaction: disnake.ApplicationCommandInteraction):
        """
        Send version information for TaruBot as an ephemeral response.
        This asynchronous command sends a formatted message containing:
            - The current bot version (TaruBot 2.0.0-dev) and a disclaimer about its early, unstable development stage.
            - A note about changes and potential breakage during the development phase.
            - The GitHub repository URL for TaruBot's source code.
            - Licensing information under the GNU Affero General Public License 3.0.
            - Information about integrated services, specifically the Nodestone project used for Lodestone interactions,
                including a reference to its source code and a note on the absence of an explicitly provided license.
        Parameters:
                interaction (disnake.ApplicationCommandInteraction): The interaction instance that triggered this command.
        """

        await interaction.send(
            """# TaruBot 2.0.0-dev

**Note**: TaruBot v2 is in early and heavy development. Things will break, things will change. Abandon hope all ye who enter here.

## TaruBot Source Code
The source code for this bot is available at https://github.com/theconnstruct/tarubot.
TaruBot's source code is licensed under the **GNU Affero General Public License 3.0**.

## Integrated Services
### Nodestone
This bot interacts with Lodestone via the Nodestone project. The source code for Nodestone is available at https://github.com/xivapi/nodestone.
Unfortunately, no software license has been included with the Nodestone source code. I've asked the author what license applies to the Nodestone source code.""",
            ephemeral=True,
        )


def setup(bot: TaruBot):
    """
    Initializes and attaches the UtilityCommandsCog to the provided bot instance.
    Parameters:
        bot (TaruBot): The bot instance to which the UtilityCommandsCog is added.
    """

    bot.add_cog(UtilityCommandsCog(bot))
