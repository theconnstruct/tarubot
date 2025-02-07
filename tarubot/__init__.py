import os

import coloredlogs
from dotenv import load_dotenv

load_dotenv()
coloredlogs.install(level=os.environ.get("LOG_LEVEL") or "WARNING")
