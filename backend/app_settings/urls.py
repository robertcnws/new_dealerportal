from django.urls import path
from . import views

app_name = "app_settings"

urlpatterns = [
    # API DEALERPORTAL
    path("dealeportal/settings/", views.api_dealerportal_settings, name="api_dealerportal_settings"),
    path("dealeportal/users/change_auth_role/<int:pk>/", views.api_dealerportal_change_auth_user_role, name="api_dealerportal_change_auth_user_role"),
    path("dealeportal/users/change_auth_status/<int:pk>/", views.api_dealerportal_change_auth_user_status, name="api_dealerportal_change_auth_user_status"),
    path("dealeportal/users/", views.api_dealerportal_authorized_users, name="api_dealerportal_authorized_users"),
    # #######
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
