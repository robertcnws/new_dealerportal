from django.urls import path
from . import views

app_name = "zoho_api"

urlpatterns = [
    path("zoho/generate_auth_url/", views.generate_auth_url, name="generate_auth_url"),
    path("zoho/get_refresh_token/", views.get_refresh_token, name="get_refresh_token"),
    path("zoho/settings/", views.zoho_api_settings, name="zoho_api_settings"),
    path("zoho/connect/", views.zoho_api_connect, name="zoho_api_connect"),
    path(
        "zoho/sync_zoho_items/",
        views.sync_zoho_items_view,
        name="zoho_api_sync_zoho_items",
    ),
    path(
        "zoho/sync/prices/",
        views.sync_zoho_pricebook_view,
        name="sync_zoho_pricebook",
    ),
    path(
        "sync-zoho-customers/",
        views.sync_zoho_customers_view,
        name="sync_zoho_customers",
    ),
    path("zoho/revoke/", views.revoke_zoho_connection, name="revoke_zoho_connection"),
    # path("zoho/test/", views.test, name="revoke_zoho_connection"),
]
