from django.db import models
from django.utils.crypto import get_random_string
from base.models import User, DealerAccount


class Invitation(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=50, unique=True)
    is_accepted = models.BooleanField(default=False)
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    dealership = models.ForeignKey(DealerAccount, null=True, on_delete=models.SET_NULL)
    role = models.CharField(max_length=50, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Add this line
    updated_at = models.DateTimeField(auto_now=True)  # And this line

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = get_random_string(50)
        super().save(*args, **kwargs)
