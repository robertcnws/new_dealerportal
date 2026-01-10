from zoho_api.models import AppConfig
from base.models import Product, ItemGroup
from utils.views import is_after
from django.conf import settings
from django.utils import timezone
from datetime import datetime

import time

import requests

import logging

logger = logging.getLogger(__name__)

# HELPER FUNCTIONS FOR MAIN LOAD ZOHO INVENTORY API

def _normalize_datetime(raw_last_modified):
    last_modified = None
    if raw_last_modified:
        if isinstance(raw_last_modified, str):
            dt = datetime.fromisoformat(raw_last_modified)
        else:
            dt = raw_last_modified

        if timezone.is_naive(dt):
            last_modified = timezone.make_aware(dt)
        else:
            last_modified = dt

    return last_modified

def _get_from_main_load_api(module, url, headers, params):
    items_data = []
    page = params.get("page", 1)
    try:
        while True:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()

            data = response.json()
            items = data["results"]
            items_data.extend(items)
            
            if len(items) < 200:
                break

            page += 1
            params["page"] = page
            
            time.sleep(1)
            
        return items_data, None
    except requests.RequestException as e:
        logger.error(f"Error fetching {module} from Main Load Zoho Inventory API: {str(e)}")
        return [], str(e)
    
    
# GET ITEMS TO SYNC FROM MAIN LOAD ZOHO INVENTORY
    
def get_items_to_sync(organization_id, last_sync_time) -> tuple[list[dict], str | None]:
    url = f"{settings.API_MAIN_DATA_URL}/zoho/items/"
    access_token = settings.API_MAIN_DATA_TOKEN
    headers = {"Authorization": f"Token {access_token}"}
    
    page = 1
    
    last_modified_time = last_sync_time.strftime("%Y-%m-%d")
    
    logger.info(f"From URL: {url}")
    logger.info(f"Fetching items modified after: {last_modified_time}")
    logger.info(f"Using organization ID: {organization_id}")
    logger.info("Starting to fetch items from Main Load Zoho Inventory API")
    logger.info("This may take a while depending on the number of items to sync")
    logger.info("Please wait...")
    
    params = {
        "page": page,
        "page_size": 200,
        "start_last_modified_time": last_modified_time,
        "end_last_modified_time": datetime.now().strftime("%Y-%m-%d"),
        "zoho_org_id": organization_id,
    }
    
    items_data, str_err = _get_from_main_load_api("items", url, headers, params)
    
    if str_err:
        return [], str_err
    
    filtered_items = []
    for item_data in items_data:
        if (
            item_data.get("sku")
            and item_data.get("status") == "active"
            and item_data.get("group_id")
            and is_after(item_data.get("last_modified_time"), last_sync_time)
        ):
            filtered_items.append(item_data)
                
    logger.info(f"Total items fetched from Main Load Zoho Inventory API: {len(items_data)}")
    logger.info(f"Total items to sync after filtering: {len(filtered_items)}")
    return filtered_items, None


# SYNG ITEMS FROM MAIN LOAD ZOHO INVENTORY
def sync_zoho_items():
    app_config = AppConfig.objects.first()
    organization_id = app_config.zoho_org_id
    last_sync_time = app_config.zoho_last_sync_time
    
    logger.info(f"Last sync time: {last_sync_time}")
    logger.info(f"Organization ID: {organization_id}")
    logger.info("Fetching items to sync from Main Load Zoho Inventory")

    items_data, str_err = get_items_to_sync(organization_id, last_sync_time)
    
    if str_err:
        logger.error(f"Error fetching items to sync: {str_err}")
        return 0
    
    logger.info(f"Total items to sync: {len(items_data)}")

    item_data_chunks = [items_data[i:i + 100] for i in range(0, len(items_data), 100)]

    for chunk in item_data_chunks:
        for item_data in chunk:
            zoho_item_id = item_data.get("item_id")
            if not zoho_item_id:
                continue

            group_id = item_data.get("group_id")
            group_name = item_data.get("group_name")

            item_group = None
            if group_id:
                item_group, _ = ItemGroup.objects.update_or_create(
                    group_id=group_id,
                    defaults={"group_name": group_name},
                )
                
            raw_last_modified = item_data.get("last_modified_time")
            last_modified = _normalize_datetime(raw_last_modified)

            Product.objects.update_or_create(
                zoho_item_id=zoho_item_id,
                defaults={
                    "name": item_data.get("name", ""),
                    "description": item_data.get("description", ""),
                    "sku": item_data.get("sku", ""),
                    "stock": item_data.get("actual_available_for_sale_stock", None),
                    "zoho_group": item_group,
                    "last_modified": last_modified,
                },
            )
        time.sleep(1)
        
    now = datetime.now()
    app_config.zoho_last_sync_time = _normalize_datetime(now)
    app_config.save()

    return len(items_data)


