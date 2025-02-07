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


from dotenv import load_dotenv
import coloredlogs
import logging
import os

load_dotenv()

coloredlogs.install(level=os.environ.get("LOG_LEVEL") or "WARNING")

clean_start = True

if not os.environ.get("DISCORD_API_TOKEN"):
    logging.critical(
        "No Discord API token found in environment variables. Set DISCORD_API_TOKEN."
    )
    clean_start = False

if not os.environ.get("NODESTONE_BASE_URI"):
    logging.critical(
        "No Nodestone API base URI found in environment variables. Set NODESTONE_BASE_URI."
    )
    clean_start = False

if not clean_start:
    logging.critical("Exiting due to missing environment variables.")
    exit(1)
