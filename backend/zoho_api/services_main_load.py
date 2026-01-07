from zoho_api.models import AppConfig
from base.models import Product, ItemGroup
from utils.views import is_after
from django.conf import settings
from datetime import datetime

import time

import requests

# SYNG ITEMS FROM MAIN LOAD ZOHO INVENTORY
def sync_zoho_items():
    app_config = AppConfig.objects.first()
    organization_id = app_config.zoho_org_id
    last_sync_time = app_config.zoho_last_sync_time

    items_data = get_items_to_sync(organization_id, last_sync_time)

    item_data_chunks = [items_data[i : i + 100] for i in range(0, len(items_data), 100)]

    for chunk in item_data_chunks:

        for item_detail in chunk:
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

            _, _ = Product.objects.update_or_create(
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


def get_items_to_sync(organization_id, last_sync_time):
    url = f"{settings.API_MAIN_DATA_URL}/zoho/items/"
    access_token = settings.API_MAIN_DATA_TOKEN
    headers = {"Authorization": f"Token {access_token}"}

    items_data = []
    page = 1
    
    last_modified_time = last_sync_time.strftime("%Y-%m-%d")

    while True:
        params = {
            "page": page,
            "page_size": 200,
            "start_last_modified_time": last_modified_time,
            "end_last_modified_time": datetime.now().strftime("%Y-%m-%d"),
            "zoho_org_id": organization_id,
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        items = data["results"]
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