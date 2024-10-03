from django.urls import path
from . import views

app_name = "notifications"


urlpatterns = [
    # API Dealerportal
    path("dealerportal/get-all-notifications/", views.api_dealerportal_get_all_notifications, name="api_dealerportal_get_all_notifications"),
    path("dealerportal/read-notification/", views.api_dealerportal_read_notification, name="api_dealerportal_read_notification"),
    # 
    path("mark-as-read/", views.mark_as_read, name="mark_as_read"),
    path(
        "mark-as-read/all/",
        views.remove_all_notifications,
        name="remove_all_notifications",
    ),
]
