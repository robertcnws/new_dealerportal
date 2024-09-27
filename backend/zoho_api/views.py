# myapp/views.py
from django.shortcuts import render, redirect
from django.views import View
from .models import AppConfig
from base.models import Product, ItemGroup, DealerAccount, User  # Add this line
from .forms import ZohoAPIForm
import requests
from django.urls import reverse
from django.contrib import messages
from concurrent.futures import ThreadPoolExecutor, as_completed
import concurrent.futures
import time
from datetime import datetime
from utils.views import is_after
from base.decorators import role_required
from django.contrib.auth.decorators import login_required
from notifications.views import create_notification

from django.db.models import Q
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import JsonResponse
from django.forms.models import model_to_dict

import json

import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)





def generate_auth_url(request):
    app_config = AppConfig.objects.first()
    client_id = app_config.zoho_client_id
    redirect_uri = app_config.zoho_redirect_uri
    scopes = "ZohoInventory.items.READ,ZohoInventory.salesorders.READ,ZohoInventory.salesorders.CREATE,ZohoInventory.invoices.READ,ZohoInventory.contacts.READ,ZohoInventory.settings.READ"
    auth_url = f"https://accounts.zoho.com/oauth/v2/auth?scope={scopes}&client_id={client_id}&response_type=code&access_type=offline&redirect_uri={redirect_uri}"
    return redirect(auth_url)


def get_access_token(client_id, client_secret, refresh_token):
    token_url = "https://accounts.zoho.com/oauth/v2/token"
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    response = requests.post(token_url, data=payload)

    if response.status_code == 200:
        access_token = response.json()["access_token"]
    else:
        raise Exception("Error retrieving access token")

    return access_token


def get_refresh_token(request):
    authorization_code = request.GET.get("code", None)

    if not authorization_code:
        messages.error(request, "Authorization code is missing")
        return redirect(reverse("zoho_api:zoho_api_connect"))

    app_config = AppConfig.objects.first()
    token_url = "https://accounts.zoho.com/oauth/v2/token"
    data = {
        "code": authorization_code,
        "client_id": app_config.zoho_client_id,
        "client_secret": app_config.zoho_client_secret,
        "redirect_uri": app_config.zoho_redirect_uri,
        "grant_type": "authorization_code",
    }

    response = requests.post(token_url, data=data)
    response.raise_for_status()

    response_json = response.json()
    access_token = response_json.get("access_token", None)
    refresh_token = response_json.get("refresh_token", None)

    if access_token and refresh_token:
        # Save the refresh token to the AppConfig model
        app_config = AppConfig.objects.first()
        if app_config:
            app_config.zoho_refresh_token = refresh_token
            app_config.save()

        return redirect(reverse("zoho_api:zoho_api_connect"))
    else:
        messages.error(
            request,
            "Failed to obtain access_token and/or refresh_token: {}".format(
                response_json
            ),
        )
        return redirect(reverse("zoho_api:zoho_api_connect"))


# GET THE ZOHO API ACCESS TOKEN


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def zoho_api_settings(request):
    app_config = AppConfig.objects.first()

    # if there's no AppConfig instance, create a default one
    if not app_config:
        app_config = AppConfig.objects.create()

    zoho_connection_configured = app_config.zoho_connection_configured
    connected = (
        app_config.zoho_connection_configured
        and app_config.zoho_refresh_token is not None
        or ""
    )

    if request.method == "GET":
        form = ZohoAPIForm(instance=app_config)
    elif request.method == "POST":
        form = ZohoAPIForm(request.POST, instance=app_config)
        if form.is_valid():
            form.save()
            messages.success(
                request, "Zoho API settings have been updated successfully."
            )
            return redirect("zoho_api:zoho_api_settings")
        else:
            messages.error(
                request,
                "There was an error updating Zoho API settings. Please correct the errors below.",
            )

    # Generate the auth_url for Zoho API authentication only if not connected
    auth_url = None
    if not connected:
        auth_url = reverse("zoho_api:generate_auth_url")

    context = {
        "connected": connected,
        "last_sync_time": app_config.zoho_last_sync_time,
        "auth_url": auth_url,
        "zoho_connection_configured": zoho_connection_configured,
        "form": form,
        "active_page": "settings",
    }
    return render(request, "zoho_api/zoho_api_settings.html", context)


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def zoho_api_connect(request):
    app_config = AppConfig.objects.first()
    if app_config.zoho_connection_configured:
        try:
            access_token = get_access_token(
                app_config.zoho_client_id,
                app_config.zoho_client_secret,
                app_config.zoho_refresh_token,
            )
            messages.success(request, "Zoho API connected successfully.")
        except Exception as e:
            messages.error(request, f"Error connecting to Zoho API: {str(e)}")
    else:
        messages.warning(request, "Zoho API connection is not configured yet.")

    return redirect("zoho_api:zoho_api_settings")


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def sync_zoho_items_view(request):
    app_config = AppConfig.objects.first()
    if not app_config.zoho_connection_configured:
        messages.error(request, "Zoho API connection is not configured.")
        return redirect("zoho_api:zoho_api_settings")

    try:
        access_token = get_access_token(
            app_config.zoho_client_id,
            app_config.zoho_client_secret,
            app_config.zoho_refresh_token,
        )
        synced_items_count = sync_zoho_items(access_token)
        messages.success(
            request,
            f"Successfully synced {synced_items_count} items from Zoho Inventory",
        )
    except Exception as e:
        messages.error(request, f"Error syncing items: {str(e)}")

    return redirect("zoho_api:zoho_api_settings")


# SYNG ITEMS FROM ZOHO INVENTORY
def sync_zoho_items(access_token):
    app_config = AppConfig.objects.first()
    organization_id = app_config.zoho_org_id
    last_sync_time = app_config.zoho_last_sync_time

    items_data = get_items_to_sync(access_token, organization_id, last_sync_time)

    url = f"https://www.zohoapis.com/inventory/v1/itemdetails?organization_id={organization_id}"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

    item_data_chunks = [items_data[i : i + 100] for i in range(0, len(items_data), 100)]

    for chunk in item_data_chunks:
        item_id_list = ",".join([item_data[0] for item_data in chunk])
        params = {"item_ids": item_id_list}

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()

        items_details = data["items"]

        for item_detail in items_details:
            item_data = item_detail
            zoho_item_id = item_data["item_id"]

            group_id = None
            group_name = None
            for item_id, grp_id, grp_name in chunk:
                if zoho_item_id == item_id:
                    group_id = grp_id
                    group_name = grp_name
                    break

            if group_id:
                item_group, _ = ItemGroup.objects.update_or_create(
                    group_id=group_id,
                    defaults={
                        "group_name": group_name,
                    },
                )
            else:
                item_group = None

            name = item_data["name"]
            description = item_data["description"]
            # sales_price = item_data["rate"]
            sku = item_data["sku"]
            stock_on_hand = item_data.get("actual_available_for_sale_stock", None)
            last_modified_time = item_data.get("last_modified_time", None)

            product, _ = Product.objects.update_or_create(
                zoho_item_id=zoho_item_id,
                defaults={
                    "name": name,
                    "description": description,
                    # "price": sales_price,
                    "sku": sku,
                    "stock": stock_on_hand,
                    "zoho_group": item_group,
                    "last_modified": last_modified_time,
                },
            )

        # Sleep for 1 second to avoid making too many API calls in a short period
        time.sleep(1)

    app_config.zoho_last_sync_time = datetime.now()
    app_config.save()

    return len(items_data)


def get_items_to_sync(access_token, organization_id, last_sync_time):
    url = f"https://www.zohoapis.com/inventory/v1/items?organization_id={organization_id}"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

    items_data = []
    page = 1

    while True:
        params = {
            "page": page,
            "per_page": 200,
            "fields": "item_id,sku,status,group_id,group_name,last_modified_time",
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        items = data["items"]
        items_data.extend(items)

        # Break the loop if the items list is empty or has less than 200 items
        if len(items) < 200:
            break

        page += 1

        # Sleep for 1 seconds to avoid making too many API calls in a short period
        time.sleep(1)

    filtered_items = []
    for item_data in items_data:
        if (
            item_data.get("sku")
            and item_data.get("status") == "active"
            and item_data.get("group_id")
            and is_after(item_data.get("last_modified_time"), last_sync_time)
        ):
            filtered_items.append(
                (
                    item_data.get("item_id"),
                    item_data.get("group_id"),
                    item_data.get("group_name"),
                )
            )

    return filtered_items


def sync_order_to_zoho(order):
    """
    Sync a given order to Zoho
    """
    app_config = AppConfig.objects.first()
    if app_config.zoho_connection_configured:
        try:
            access_token = get_access_token(
                app_config.zoho_client_id,
                app_config.zoho_client_secret,
                app_config.zoho_refresh_token,
            )
            headers = {
                "Authorization": f"Zoho-oauthtoken {access_token}",
                "Content-Type": "application/json",
            }
            sales_order_url = "https://www.zohoapis.com/inventory/v1/salesorders"

            # Get all the QuoteProduct items associated with the order
            quote_products = order.quote.get_products()

            # Prepare a list of items to be included in the sales order
            items = []
            for quote_product in quote_products:
                items.append(
                    {
                        "item_id": quote_product.product.zoho_item_id,
                        "quantity": quote_product.quantity,
                        "rate": float(
                            quote_product.product.price
                        ),  # Replace this with the actual rate of the product
                    }
                )

            # Preparing data for the Zoho API, replace field names with your actual Zoho sales order fields
            data = {
                "customer_id": order.owner.dealer_account.zoho_id,
                "line_items": items,
            }
            response = requests.post(sales_order_url, headers=headers, json=data)
            response.raise_for_status()
            zoho_order = response.json()["salesorder"]
            order.zoho_order_id = zoho_order["salesorder_id"]
            order.save()
            return True, "Sales order succesfully sent to New Window System."
        except Exception as e:
            return (
                False,
                f"Error sending the sales order to New Window System. Please call them for follow up.: {str(e)}",
            )
    else:
        return False, "Zoho API connection is not configured yet."


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def sync_zoho_customers_view(request):
    app_config = AppConfig.objects.first()
    access_token = get_access_token(
        app_config.zoho_client_id,
        app_config.zoho_client_secret,
        app_config.zoho_refresh_token,
    )
    app_admins_and_managers = User.objects.filter(
        Q(role="AppAdmin") | Q(role="AppManager")
    )

    try:
        num_customers_synced = sync_zoho_customers(access_token, app_config)
    except Exception as e:
        message = messages.error(request, str(e))
        create_notification(app_admins_and_managers, "system_Alert", message=message)
        return redirect(reverse("zoho_api:zoho_api_settings"))

    messages.success(request, f"Successfully synced {num_customers_synced} customers.")
    message = f"Successfully synced {num_customers_synced} customers."
    create_notification(app_admins_and_managers, "system_Alert", message=message)
    return redirect(reverse("zoho_api:zoho_api_settings"))


BATCH_SIZE = 100  
MAX_WORKERS = 10 

def fetch_customers_page(url, headers, params):
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        raise Exception(f"Failed to fetch customers data: {str(e)}")
    

def process_batch(batch):
    with transaction.atomic(): 
        dealer_accounts_to_update = []
        for customer in batch:
            zoho_customer_id = customer["contact_id"]
            email = customer["email"]
            dealer_account = DealerAccount.objects.filter(zoho_email=email).first()
            if dealer_account:
                dealer_account.zoho_id = zoho_customer_id
                dealer_accounts_to_update.append(dealer_account)

        if dealer_accounts_to_update:
            DealerAccount.objects.bulk_update(dealer_accounts_to_update, ['zoho_id'])

    return len(dealer_accounts_to_update)  


def sync_zoho_customers(access_token, app_config):
    organization_id = app_config.zoho_org_id
    url = f"https://www.zohoapis.com/inventory/v1/contacts?organization_id={organization_id}"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

    num_customers_synced = 0
    page = 1
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        while True:
            params = {"page": page, "per_page": 200}
            data = fetch_customers_page(url, headers, params)
            contacts = data.get("contacts", [])

            if not contacts:
                break
            
            batches = [contacts[i:i + BATCH_SIZE] for i in range(0, len(contacts), BATCH_SIZE)]
            
            for batch in batches:
                futures.append(executor.submit(process_batch, batch))

            page += 1

        for future in concurrent.futures.as_completed(futures):
            num_customers_synced += future.result() 
    
    app_config.zoho_last_sync_time = datetime.now()
    app_config.save()

    return num_customers_synced


# def sync_zoho_customers(access_token, app_config):
#     organization_id = app_config.zoho_org_id
#     url = (
#         f"https://www.zohoapis.com/inventory/v1/contacts?organization_id={organization_id}"
#     )
#     headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

#     customers_data = []
#     page = 1
#     num_customers_synced = 0

#     while True:
#         params = {
#             "page": page,
#             "per_page": 200,
#         }

#         try:
#             response = requests.get(url, headers=headers, params=params)
#             response.raise_for_status()
#         except requests.exceptions.HTTPError as e:
#             raise Exception(f"Failed to fetch customers data: {str(e)}")

#         data = response.json()
#         contacts = data.get("contacts", [])

#         if not contacts:
#             break

#         customers_data.extend(contacts)
#         page += 1

#         # Sleep for 1 seconds to avoid making too many API calls in a short period
#         time.sleep(1)

#     for customer in customers_data:
#         zoho_customer_id = customer["contact_id"]
#         email = customer["email"]

#         dealer_account = DealerAccount.objects.filter(zoho_email=email).first()

#         if dealer_account:
#             dealer_account.zoho_id = zoho_customer_id
#             dealer_account.save()
#             num_customers_synced += 1

#     app_config.zoho_last_sync_time = datetime.now()
#     app_config.save()

#     return num_customers_synced


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def revoke_zoho_connection(request):
    app_config = AppConfig.objects.first()

    # Check if Zoho API connection is already configured
    if not app_config.zoho_connection_configured:
        messages.error(request, "Zoho API connection is not configured.")
        return redirect("zoho_api:zoho_api_settings")

    refresh_token = app_config.zoho_refresh_token

    # If no refresh token present, the integration has never been connected
    if not refresh_token:
        messages.info(request, "Zoho API connection has not been established.")
        return redirect("zoho_api:zoho_api_settings")

    # Revoke the refresh token
    revoke_url = "https://accounts.zoho.com/oauth/v2/token/revoke"
    data = {
        "token": refresh_token,
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }

    try:
        response = requests.post(revoke_url, data=data, headers=headers)
        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        messages.error(request, f"Failed to revoke Zoho API connection: {e}")
        return redirect("zoho_api:zoho_api_settings")

    # Clear the other API fields in AppConfig
    app_config.zoho_refresh_token = None
    app_config.zoho_client_id = None
    app_config.zoho_client_secret = None
    app_config.zoho_org_id = None
    app_config.zoho_redirect_uri = None
    app_config.zoho_connection_configured = False

    app_config.save()

    messages.success(request, "Zoho API connection has been revoked.")
    return redirect("zoho_api:zoho_api_settings")


@login_required(login_url="base-login")
@role_required(["AppAdmin"])
def sync_zoho_pricebook_view(request):
    app_config = AppConfig.objects.first()
    access_token = get_access_token(
        app_config.zoho_client_id,
        app_config.zoho_client_secret,
        app_config.zoho_refresh_token,
    )
    app_admins_and_managers = User.objects.filter(
        Q(role="AppAdmin") | Q(role="AppManager")
    )

    try:
        num_pricebook_items_synced = sync_zoho_pricebook(access_token)
    except Exception as e:
        message = "Error during the sync of the pricelists from Zoho."
        messages.error(request, message)
        create_notification(app_admins_and_managers, "system_Alert", message=message)
        return redirect(reverse("zoho_api:zoho_api_settings"))

    messages.success(
        request, f"Successfully synced {num_pricebook_items_synced} prices."
    )
    message = f"Successfully synced {num_pricebook_items_synced} pricebook items."
    create_notification(app_admins_and_managers, "system_Alert", message=message)
    return redirect(reverse("zoho_api:zoho_api_settings"))


def sync_zoho_pricebook(access_token):
    app_config = AppConfig.objects.first()
    organization_id = app_config.zoho_org_id
    pricebook_id = "3154577000001329002"

    url = f"https://www.zohoapis.com/inventory/v1/pricebooks/{pricebook_id}?organization_id={organization_id}"
    headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    data = response.json()
    pricebook = data["pricebook"]

    # Print pricebook item data for testing purposes
    # print(pricebook)

    for pricebook_item in pricebook["pricebook_items"]:
        zoho_item_id = pricebook_item["item_id"]
        sales_price = pricebook_item["pricebook_rate"]

        # Find the product in the database and update its price
        try:
            product = Product.objects.get(zoho_item_id=zoho_item_id)
            product.price = sales_price
            product.save()
        except Product.DoesNotExist:
            # Handle the case when the product does not exist in your database
            pass

    app_config.zoho_last_sync_time = datetime.now()
    app_config.save()

    return len(pricebook["pricebook_items"])


# VALIDATE JWT TOKEN

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
            logger.error(f"Error validating token: {e}")
            return False
    else:
        return False


# API DEALERPORTAL

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_zoho_api_settings(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        app_config = AppConfig.objects.first()
        if not app_config:
            app_config = AppConfig.objects.create()

        zoho_connection_configured = app_config.zoho_connection_configured
        connected = (
            app_config.zoho_connection_configured
            and app_config.zoho_refresh_token is not None
            or ""
        )
        if request.method == "GET":
            form = ZohoAPIForm(instance=app_config)
        elif request.method == "POST":
            data = json.loads(request.body)
            form = ZohoAPIForm(data, instance=app_config)   
            if form.is_valid():
                form.save()
                message = "Zoho API settings have been updated successfully."
                return JsonResponse({"message": message}, status=200)
            else:
                message = "There was an error updating Zoho API settings. Please correct the errors below."
                return JsonResponse({"error": message, 'message': message}, status=400)
        
        auth_url = None
        if not connected:
            auth_url = reverse("zoho_api:generate_auth_url")
        context = {
            "connected": connected,
            "last_sync_time": app_config.zoho_last_sync_time,
            "auth_url": auth_url,
            "zoho_connection_configured": zoho_connection_configured,
            "app_config": model_to_dict(app_config, exclude=["logo"]),
            "active_page": "settings",
        }
        return JsonResponse(context, status=200)
    return JsonResponse({"error": "Unauthorized"}, status=401)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_sync_zoho_items_view(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        app_config = AppConfig.objects.first()
        if not app_config.zoho_connection_configured:
            message = "Zoho API connection is not configured."
            return JsonResponse({"error": message, "message": message}, status=200)
        try:
            access_token = get_access_token(
                app_config.zoho_client_id,
                app_config.zoho_client_secret,
                app_config.zoho_refresh_token,
            )
            synced_items_count = sync_zoho_items(access_token)
            message = f"Successfully synced {synced_items_count} items from Zoho Inventory"
            return JsonResponse({"message": message}, status=200)
        except Exception as e:
            message = f"Error syncing items: {str(e)}"
            return JsonResponse({"error": message, "message": message}, status=200)
    return JsonResponse({"error": "Unauthorized"}, status=401)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@role_required(["AppAdmin"])
def api_dealerportal_sync_zoho_customers_view(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        app_config = AppConfig.objects.first()
        access_token = get_access_token(
            app_config.zoho_client_id,
            app_config.zoho_client_secret,
            app_config.zoho_refresh_token,
        )
        app_admins_and_managers = User.objects.filter(
            Q(role="AppAdmin") | Q(role="AppManager")
        )
        try:
            num_customers_synced = sync_zoho_customers(access_token, app_config)
            message = f"Successfully synced {num_customers_synced} customers."
            error = None
        except Exception as e:
            message = str(e)
            error = str(e)
        create_notification(app_admins_and_managers, "system_Alert", message=message)
        return JsonResponse({"message": message, "error": error}, status=200)
    return JsonResponse({"error": "Unauthorized"}, status=401)



