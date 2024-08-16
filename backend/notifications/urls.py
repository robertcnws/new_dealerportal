from django.urls import path
from . import views

app_name = "notifications"


urlpatterns = [
    path("mark-as-read/", views.mark_as_read, name="mark_as_read"),
    path(
        "mark-as-read/all/",
        views.remove_all_notifications,
        name="remove_all_notifications",
    ),
]
