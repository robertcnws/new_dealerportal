from django.db import models
from base.models import User


class Notification(models.Model):
    # Types of notifications
    TYPE_CHOICES = (
        ("estimate", "Estimate"),
        ("order", "Order"),
        ("system_Alert", "System Alert"),
        ("system_user_alert", "System User Alert"),
        # Add more types as needed...
    )

    users = models.ManyToManyField(User, related_name="notifications")
    message = models.TextField(blank=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)
    # Other necessary fields (order id, estimate id, etc.)
