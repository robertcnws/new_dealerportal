from django.shortcuts import render, redirect
from django.contrib import messages

from django.contrib.auth.decorators import login_required

from base.decorators import role_required

from base.models import User
from utils.models import Invitation
from django.db.models import Q


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
