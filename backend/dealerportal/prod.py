# production.py
import os

DEBUG = False

ALLOWED_HOSTS = ["dealerportal.herokuapp.com"]

# Production logging settings
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": "/var/log/django/production.log",
        },
    },
    "root": {
        "handlers": ["file"],
        "level": "WARNING",
    },
}

# Add any other production-specific settings here
CELERY_BROKER_URL = os.environ["REDIS_URL"]
