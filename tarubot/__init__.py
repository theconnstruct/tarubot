from dotenv import load_dotenv
import coloredlogs
import os

load_dotenv()
coloredlogs.install(level=os.environ.get("LOG_LEVEL") or "WARNING")
