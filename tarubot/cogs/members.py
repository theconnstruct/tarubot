from ..lib.tarubot import TaruBot
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

    @slash_command(
        description="Set up the member admission interface for the lobby channel.",
        default_member_permissions=Permissions.administrator,
    )
    async def setup(
        self, interaction: ApplicationCommandInteraction, channel: TextChannel
    ):
        logging.debug(f"Setting up member admission interface for {channel.name}...")

        channel.send(
            "To access the server, click the button below.",
            components=[Button(label="Join", custom_id="member_entry_button")],
        )

    @Cog.listener("on_button_click")
    async def on_button_click(self, interaction: MessageInteraction):
        if interaction.component.custom_id != "member_entry_button":
            return

        interaction.send("You have been granted access to the server.")


def setup(bot: TaruBot):
    logging.debug("Loading UtilityCommandsCog...")
    bot.add_cog(MemberManagementCog(bot))
    logging.debug("UtilityCommandsCog loaded.")
