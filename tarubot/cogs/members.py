from ..lib.tarubot import TaruBot
from ..ui.modals.lobby import LobbyModal
from disnake import (
    ApplicationCommandInteraction,
    MessageInteraction,
    Permissions,
    TextChannel,
)
from disnake.ui import Button
from disnake.ext.commands import Cog, slash_command
import logging


class MemberManagementCog(Cog):
    def __init__(self, bot):
        self.bot = bot
        logging.debug("MemberManagementCog initialized.")

    @slash_command(
        description="Set up the member admission interface for the lobby channel.",
        default_member_permissions=Permissions(administrator=True),
    )
    async def setup(
        self, interaction: ApplicationCommandInteraction, channel: TextChannel
    ):
        logging.debug(
            f"Received setup command from {interaction.user} for channel {channel.name}."
        )
        logging.debug(f"Setting up member admission interface for {channel.name}...")

        await channel.send(
            "To access the server, click the button below.",
            components=[Button(label="Join", custom_id="member_entry_button")],
        )

        logging.debug(f"Sent member admission interface message to {channel.name}.")

        await interaction.send("Member admission interface set up.", ephemeral=True)

        logging.debug("Sent confirmation message to interaction user.")

    @Cog.listener("on_button_click")
    async def on_button_click(self, interaction: MessageInteraction):
        logging.debug(
            f"Button click detected from {interaction.user} with custom_id {interaction.component.custom_id}."
        )

        if interaction.component.custom_id != "member_entry_button":
            logging.debug("Button click ignored, not the member entry button.")
            return

        logging.debug("Member entry button clicked, sending LobbyModal.")
        await interaction.response.send_modal(modal=LobbyModal(interaction))
        logging.debug("LobbyModal sent to interaction user.")


def setup(bot: TaruBot):
    logging.debug("Loading MemberManagementCog...")
    bot.add_cog(MemberManagementCog(bot))
    logging.debug("MemberManagementCog loaded.")
