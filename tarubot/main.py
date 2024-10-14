from .lib.tarubot import TaruBot
from disnake import Intents
from os import getenv
import logging


def main():
    if not getenv("DISCORD_TOKEN"):
        logging.critical("Environment variable DISCORD_TOKEN is not set.")
        return

    if not getenv("DISCORD_GUILD_ID"):
        logging.warning(
            "Environment variable DISCORD_GUILD_ID is not set. Commands will be registered as global commands."
        )

    intents = Intents.default()
    intents.members = True

    logging.debug("Creating bot instance...")
    bot = TaruBot(
        int(getenv("DISCORD_GUILD_ID")) if getenv("DISCORD_GUILD_ID") else None,
        intents=intents,
    )

    try:
        logging.debug("Loading cogs...")
        bot.load_extensions("tarubot/cogs")
        logging.debug("Cogs loaded.")

        bot.run(getenv("DISCORD_TOKEN"))
    except Exception as e:
        logging.critical(f"An error occurred: {e}")
        exit(1)
