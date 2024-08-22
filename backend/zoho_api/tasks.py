from __future__ import absolute_import, unicode_literals
from celery import shared_task
from .views import sync_zoho_items, get_access_token, sync_zoho_pricebook
from .models import AppConfig, User
from notifications.views import create_notification
from notifications.models import Notification
import logging
from datetime import datetime, timedelta, timezone
from django.db.models import Q

logger = logging.getLogger(__name__)


# @shared_task(bind=True)
# def test_func(self):
#     for i in range(10):
#         print(i)
#     return "Done"


@shared_task(bind=True)
def sync_zoho_items_task(self):
    app_config = AppConfig.objects.first()
    # Get the superuser
    superadmin = User.objects.get(is_superuser=True)

    # Check if zoho is configured
    if not app_config.zoho_connection_configured:
        print("Zoho API connection is not configured.")
        return "Failed"

    try:
        # Get access token
        access_token = get_access_token(
            app_config.zoho_client_id,
            app_config.zoho_client_secret,
            app_config.zoho_refresh_token,
        )
        # Sync items
        synced_items_count = sync_zoho_items(access_token)
        success_message = (
            f"Successfully synced {synced_items_count} items from Zoho Inventory"
        )
        notification = Notification.objects.create(
            notification_type="system_Alert", message=success_message
        )
        notification.users.add(superadmin)
        print(f"Successfully synced {synced_items_count} items from Zoho Inventory")

    except Exception as e:
        failure_message = f"Error syncing items: {str(e)}"
        notification = Notification.objects.create(
            notification_type="system_Alert", message=failure_message
        )
        notification.users.add(superadmin)
        print(f"Error syncing items: {str(e)}")


@shared_task(bind=True)
def sync_zoho_pricebook_task(self):
    app_config = AppConfig.objects.first()
    superadmin = User.objects.get(is_superuser=True)
    app_admins_and_managers = User.objects.filter(
        Q(role="AppAdmin") | Q(role="AppManager")
    )

    if not app_config.zoho_connection_configured:
        print("API connection is not configured.")
        return "Failed"

    try:
        access_token = get_access_token(
            app_config.zoho_client_id,
            app_config.zoho_client_secret,
            app_config.zoho_refresh_token,
        )

        num_pricebook_items_synced = sync_zoho_pricebook(access_token)

        success_message = (
            f"Successfully synced {num_pricebook_items_synced} pricebook items."
        )
        notification = Notification.objects.create(
            notification_type="system_Alert", message=success_message
        )
        notification.users.add(*app_admins_and_managers)
        print(success_message)

    except Exception as e:
        failure_message = f"Error syncing pricebook items: {str(e)}"
        notification = Notification.objects.create(
            notification_type="system_Alert", message=failure_message
        )
        notification.users.add(*app_admins_and_managers)
        print(failure_message)
        

@shared_task(bind=True)
def delete_old_notifications():
    try:
        Notification.objects.filter(created_at__lt=timezone.now() - timedelta(days=30)).delete()
        print("Old notifications deleted")
    except Exception as e:
        print(f"Error deleting old notifications: {str(e)}")
        logger.error(f"Error deleting old notifications: {str(e)}")
