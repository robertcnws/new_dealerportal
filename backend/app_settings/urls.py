from django.urls import path
from . import views

app_name = "app_settings"

urlpatterns = [
    path("general", views.settings, name="general-settings"),
    path("users/", views.authorized_users, name="authorized-users"),
    path(
        "users/change_auth_role/<int:pk>/",
        views.change_auth_user_role,
        name="change-authuser-role",
    ),
    path(
        "users/change_auth_status/<int:pk>/",
        views.change_auth_user_status,
        name="change-authuser-status",
    ),
]
