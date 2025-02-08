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

"""
Module: Tarubot Initialization
This module initializes the environment for TaruBot by performing the following tasks:
    - Loads environment variables from a .env file, if present.
    - Configures logging with coloredlogs using a log level specified by the LOG_LEVEL environment variable,
      defaulting to "INFO" if not provided.
    - Verifies that all required environment variables are set. The required variables include:
        - DISCORD_API_TOKEN: Discord API token.
        - NODESTONE_BASE_URI: Nodestone API base URI.
If any required environment variable is missing, a critical log message is issued and the program exits.
"""

from dotenv import load_dotenv
import coloredlogs
import logging
import os

load_dotenv()

coloredlogs.install(level=os.environ.get("LOG_LEVEL") or "INFO")

required_vars = {
    "DISCORD_API_TOKEN": "Discord API token",
    "NODESTONE_BASE_URI": "Nodestone API base URI",
    "DB_HOST": "database host",
    "DB_PORT": "database port",
    "DB_USER": "database user",
    "DB_PASSWORD": "database password",
    "DB_DATABASE": "database name",
}

missing = False
for var, desc in required_vars.items():
    if not os.environ.get(var):
        logging.critical(f"No {desc} found in environment. Set {var}.")
        missing = True

if missing:
    logging.critical("Exiting due to missing environment variables.")
    exit(1)
