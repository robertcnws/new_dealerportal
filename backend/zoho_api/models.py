from django.db import models
from django.db.models import DurationField
from django.core.exceptions import ValidationError
from base.models import User


def get_default_app_admin():
    return User.objects.filter(role="AppAdmin").first().pk


class AppConfig(models.Model):
    app_id = models.AutoField(primary_key=True)
    app_admin = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "AppAdmin"},
        default=get_default_app_admin,
    )
    # api_key = models.CharField(max_length=255, blank=True, null=True)
    logo = models.ImageField(upload_to="app_logos/", blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)

    # Zoho API connection fields
    zoho_client_id = models.CharField(max_length=255, blank=True, null=True)
    zoho_client_secret = models.CharField(max_length=255, blank=True, null=True)
    zoho_org_id = models.CharField(max_length=255, blank=True, null=True)
    zoho_redirect_uri = models.CharField(max_length=255, blank=True, null=True)
    zoho_refresh_time = models.DurationField(blank=True, null=True)
    zoho_refresh_token = models.CharField(
        max_length=255, blank=True, null=True
    )  # Add this line
    zoho_connection_configured = models.BooleanField(
        default=False
    )  # Updated attribute name
    zoho_last_sync_time = models.DateTimeField(blank=True, null=True)
    # Add any other fields you want to store for the app configuration

    def save(self, *args, **kwargs):
        if not self.pk and AppConfig.objects.exists():
            # Update the existing instance if there is one
            self.pk = AppConfig.objects.get().pk

        # Check if all required fields for Zoho connection are present
        required_fields = [
            self.zoho_client_id,
            self.zoho_client_secret,
            self.zoho_org_id,
            self.zoho_redirect_uri,
        ]

        # Set zoho_connection_configured to True if all fields are not empty, else False
        self.zoho_connection_configured = all(
            field is not None and field != "" for field in required_fields
        )

        super(AppConfig, self).save(*args, **kwargs)

    def __str__(self):
        return f"App Configuration for {self.company_name}"
