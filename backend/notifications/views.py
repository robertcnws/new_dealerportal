from .models import Notification
from base.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .constants import NOTIFICATION_ICON_CLASSES
import json

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


# API DEALERPORTAL

def validateJWTTokenRequest(request):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(' ')[1]
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return True if user else False
        except (InvalidToken, TokenError) as e:
            return False
    else:
        return False
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dealerportal_get_all_notifications(request):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        user_id = request.GET.get("user_id", None)
        user = User.objects.get(id=user_id)
        notifications = Notification.objects.filter(
            users=user, is_seen=False
        ).order_by("-date")
        
        return JsonResponse({
            "notifications": list(notifications.values()),
            "NOTIFICATION_ICON_CLASSES": NOTIFICATION_ICON_CLASSES,
        }, status=200)
    # return JsonResponse({"error": "Invalid token"}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_dealerportal_read_notification(request):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        data = json.loads(request.body)
        notification_id = data.get("notification_id", None)
        notification = Notification.objects.filter(id=notification_id).first()
        if notification:
            notification.is_seen = True
            notification.save()
            return JsonResponse({"success": True}, status=200)
        return JsonResponse({"error": "Notification not found"}, status=404)
    # return JsonResponse({"error": "Invalid token"}, status=401)
    



