from .models import Notification
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required


def create_notification(users, notification_type, message):
    # Save the notification in the database
    notification = Notification.objects.create(
        notification_type=notification_type,
        message=message,
    )

    # Add users to the notification
    notification.users.add(*users)


def mark_as_read(request):
    notification_id = request.GET.get("notification_id", None)
    success = False
    if notification_id:
        notification, created = Notification.objects.update_or_create(
            id=notification_id,
            defaults={"is_seen": True},
        )
        success = True
    return JsonResponse({"success": success})


from django.shortcuts import redirect


@login_required
def remove_all_notifications(request):
    request.user.notifications.all().delete()
    return redirect(request.META.get("HTTP_REFERER", "/"))
