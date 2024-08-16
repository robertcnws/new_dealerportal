from .models import Notification
from .constants import NOTIFICATION_ICON_CLASSES


def notification_processor(request):
    if not request.user.is_authenticated:
        return {
            "notifications": [],
            "NOTIFICATION_ICON_CLASSES": NOTIFICATION_ICON_CLASSES,
        }
    notifications = Notification.objects.filter(
        users=request.user, is_seen=False
    ).order_by("-date")

    return {
        "notifications": notifications,
        "NOTIFICATION_ICON_CLASSES": NOTIFICATION_ICON_CLASSES,
    }
