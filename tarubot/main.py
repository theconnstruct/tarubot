from disnake.ext import commands
import os


def main():
    test_guild_ids = (
        list(map(int, os.environ.get("DISCORD_GUILD_IDS").split(",")))
        if os.environ.get("DISCORD_GUILD_IDS")
        else None
    )

    bot = commands.InteractionBot(test_guilds=test_guild_ids)
    bot.load_extensions("tarubot/cogs")
    bot.run(os.environ.get("DISCORD_API_TOKEN"))
