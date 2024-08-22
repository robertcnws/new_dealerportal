# celery.py
from __future__ import absolute_import, unicode_literals
import os

from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dealerportal.settings")

app = Celery("dealerportal")
app.conf.enable_utc = False

app.conf.update(timezone="America/Havana")


app.config_from_object(settings, namespace="CELERY")

# CELLERY BEAT SETTINGS
app.conf.beat_schedule = {
    "sync-zoho-products-every-35-min-between-7AM-and-5PM": {
        "task": "zoho_api.tasks.sync_zoho_items_task",
        "schedule": crontab(
            minute="0,35", hour="7-17"
        ),  # Every 35 minutes from 7AM to 5PM
    },
    "sync-zoho-products-every-1-hour-between-5PM-and-10PM": {
        "task": "zoho_api.tasks.sync_zoho_items_task",
        "schedule": crontab(minute=0, hour="17-22"),  # Every 1 hour from 5PM to 10PM
    },
    "sync-zoho-pricebook-everyday-at-midnight": {
        "task": "zoho_api.tasks.sync_zoho_pricebook_task",
        "schedule": crontab(minute=0, hour=0),  # Every day at midnight
    },
    "delete-old-notifications-each-2-months": {
        "task": "zoho_api.tasks.delete_old_notifications",
        "schedule": crontab(minute=0, hour=0, day_of_month=1, month_of_year="2,4,6,8,10,12"),
    },
}


# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


# @app.task(bind=True)
# def debug_task(self):
#     print(f"Request:{self.request!r}")
