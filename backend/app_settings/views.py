from django.shortcuts import render, redirect
from django.contrib import messages

from django.contrib.auth.decorators import login_required

from base.decorators import role_required

from base.models import User
from utils.models import Invitation
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.shortcuts import get_object_or_404

import json


# Create your views here.
# APP ADMIN SETTINGS
@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def settings(request):
    managers = User.objects.filter(role="AppManager")
    return render(
        request,
        "app_settings/settings.html",
        {
            "managers": managers,
            "active_page": "settings",
        },
    )


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def authorized_users(request):
    app_admins = User.objects.filter(role="AppAdmin")
    app_managers = User.objects.filter(role="AppManager")

    # Get the pending invitations for both roles
    pending_invites = Invitation.objects.filter(Q(role="K54Rl"), is_accepted=False)

    return render(
        request,
        "app_settings/authorized_users.html",
        {
            "app_admins": app_admins,
            "app_managers": app_managers,
            "pending_invites": pending_invites,
        },
    )


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def change_auth_user_role(request, pk):
    try:
        user_to_manage = User.objects.get(id=pk)
    except User.DoesNotExist:
        messages.error(request, "An error occurred.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if the user has permission to manage users
    if not request.user.allowed_to_manage(user_to_manage):
        messages.error(request, "You do not have permission to perform this operation.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    if request.method == "POST":
        # check if there is already an active DealerAdmin for this DealerAccount

        if user_to_manage.role == "AppAdmin":
            if User.objects.filter(role="AppAdmin").count() <= 1:
                messages.error(
                    request, "You need to have at least 1 App Administrator."
                )
                return redirect(request.META.get("HTTP_REFERER", "/"))
            else:
                user_to_manage.role = "AppManager"
                messages.success(
                    request, "User role updated to App Manager successfully."
                )
        else:
            user_to_manage.role = "AppAdmin"
            messages.success(request, "User promoted to App Administrator succesfully.")
            user_to_manage.is_active = True

        user_to_manage.save()
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def change_auth_user_status(request, pk):
    try:
        user_to_manage = User.objects.get(id=pk)
    except User.DoesNotExist:
        messages.error(request, "An error occurred.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if the user has permission to manage users
    if not request.user.allowed_to_manage(user_to_manage):
        messages.error(request, "You do not have permission to perform this operation.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if th User is AppAdmin check there are other AppAdmins
    if (
        user_to_manage.role == "AppAdmin"
        and User.objects.filter(role="AppAdmin").count() <= 1
    ):
        messages.error(
            request,
            "You need to add nother App Administrator before deactivating this User.",
        )
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Toggle the user status
    user_to_manage.is_active = not user_to_manage.is_active
    user_to_manage.save()

    action = "activated" if user_to_manage.is_active else "deactivated"
    messages.success(request, f"App User has been {action}.")
    return redirect(request.META.get("HTTP_REFERER", "/"))



# VALIDATE TOKEN

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


# API DEALERPORTAL

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_settings(request):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        managers = User.objects.filter(role="AppManager")
        list_managers = [ model_to_dict(manager, exclude=['logo', 'profile_pic']) for manager in managers ]
        return JsonResponse({"managers": list_managers}, status=200)
    # return JsonResponse({"error": "Unauthorized"}, status=401) 



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_change_auth_user_status(request, pk):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        try:
            user_to_manage = User.objects.get(id=pk)
        except User.DoesNotExist:
            message = "An error occurred."
            return JsonResponse({"error": message, "message": message}, status=200)
        
        data = json.loads(request.body) 
        user_id = data.get('user_id')
        user = get_object_or_404(User, pk=user_id)
        if not user.allowed_to_manage(user_to_manage):
            message = "You do not have permission to perform this operation."
            return JsonResponse({"error": message, "message": message}, status=200)
        
        if (
            user_to_manage.role == "AppAdmin"
            and User.objects.filter(role="AppAdmin").count() <= 1
        ):
            message = "You need to add nother App Administrator before deactivating this User."
            return JsonResponse({"error": message, "message": message}, status=200)
        
        user_to_manage.is_active = not user_to_manage.is_active
        user_to_manage.save()

        action = "activated" if user_to_manage.is_active else "deactivated"
        message = f"App User has been {action}."
        return JsonResponse({"message": message}, status=200)
    # return JsonResponse({"error": "Unauthorized"}, status=401)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_change_auth_user_role(request, pk):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        try:
            user_to_manage = User.objects.get(id=pk)
        except User.DoesNotExist:
            message = "An error occurred."
            return JsonResponse({"error": message, "message": message}, status=200)
        
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user = get_object_or_404(User, pk=user_id)
        if not user.allowed_to_manage(user_to_manage):
            message = "You do not have permission to perform this operation."
            return JsonResponse({"error": message, "message": message}, status=200)

        if request.method == "POST":

            if user_to_manage.role == "AppAdmin":
                if User.objects.filter(role="AppAdmin").count() <= 1:
                    message = "You need to have at least 1 App Administrator."
                    return JsonResponse({"error": message, "message": message}, status=200)
                else:
                    user_to_manage.role = "AppManager"
                    message = "User role updated to App Manager successfully."
            else:
                user_to_manage.role = "AppAdmin"
                message = "User promoted to App Administrator succesfully."
                user_to_manage.is_active = True

            user_to_manage.save()
            return JsonResponse({"message": message}, status=200)
        # return JsonResponse({"error": "Unauthorized"}, status=401)
    
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_authorized_users(request):
    # valid_token = validateJWTTokenRequest(request)
    # if valid_token:
        app_admins = User.objects.filter(role="AppAdmin")
        app_managers = User.objects.filter(role="AppManager")
        
        list_admins = [ model_to_dict(admin, exclude=['logo', 'profile_pic']) for admin in app_admins ]
        list_managers = [ model_to_dict(manager, exclude=['logo', 'profile_pic']) for manager in app_managers ]
        return JsonResponse({"app_admins": list_admins, "app_managers": list_managers}, status=200)
    # return JsonResponse({"error": "Unauthorized"}, status=401)
    
    
    
    
