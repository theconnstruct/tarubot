import logging
import colorlog
from os import getenv

formatter = colorlog.ColoredFormatter(
    fmt=(
        "%(blue)s%(asctime)s%(reset)s "
        "| %(log_color)s%(levelname)-8s%(reset)s | "
        "%(purple)s%(name)s:%(funcName)s:%(lineno)d%(reset)s - "
        "%(bold_white)s%(message)s%(reset)s"
    ),
    datefmt="%Y-%m-%d %H:%M:%S",
    reset=True,
    log_colors={
        "DEBUG": "cyan",
        "INFO": "green",
        "WARNING": "yellow",
        "ERROR": "light_red",
        "CRITICAL": "red",
    },
    style="%",
)

handler = colorlog.StreamHandler()
handler.setFormatter(formatter)

logging.root.setLevel(getenv("LOG_LEVEL", "INFO").upper())
logging.root.handlers = [handler]
logging.info("Log level set to %s.", logging.getLevelName(logging.root.level))
