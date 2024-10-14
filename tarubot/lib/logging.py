import logging
import colorlog


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

logging.root.setLevel(logging.DEBUG)
logging.root.handlers = [handler]
