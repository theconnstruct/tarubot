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
import disnake
import logging


class TaruBot(commands.InteractionBot):
    """
    TaruBot is a subclass of commands.InteractionBot that represents the bot instance for TaruBot.
    Attributes:
        (No additional attributes are defined beyond those inherited from the parent class.)
    Methods:
        __init__(*args, **kwargs):
            Initializes a new TaruBot instance. All provided arguments and keyword arguments are passed to the parent
            InteractionBot class for proper initialization.
        on_ready():
            Asynchronously handles the event when the bot is fully logged in and ready. It logs the login information
            for the bot user and updates the bot's presence, setting the activity status to indicate that it is "playing
            with the API".
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def on_ready(self):
        logging.info(f"Logged in as {self.user}.")

        # I was originally going to set this to "with itself," but that seemed a bit too... Y'know.
        await self.change_presence(activity=disnake.Game(name="with the API."))
