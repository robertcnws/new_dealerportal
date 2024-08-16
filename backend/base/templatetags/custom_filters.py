from django import template

from utils.views import decode_sku
from django.utils.safestring import mark_safe


register = template.Library()


@register.filter
def trim_at_char(value, char):
    return value.split(char, 1)[0]


@register.filter
def extract_between_spaces(value):
    parts = value.split(" ", 2)
    if len(parts) > 2:
        return parts[1]
    else:
        return ""


@register.filter
def sku_to_image_filename(sku):
    sku_parts = sku.split(" ")
    filename = ""

    # Add the system part (MG600, MG3000, MG350, etc.)
    filename += sku_parts[0].lower()

    # If the system is MG350, add the type of window (SH, PW)
    if sku_parts[0].lower() == "mg350" and sku_parts[1].lower() in ["sh", "pw"]:
        filename += "-" + sku_parts[1].lower()

    # If the system is MG3000 or ECO600 and it is a door, add the door type (XL, XR, XXL, XXR)
    elif sku_parts[0].lower() in ["mg3000", "eco600"] and any(
        x in sku.lower() for x in ["xl", "xr", "xxl", "xxr"]
    ):
        door_types = ["xl", "xr", "xxl", "xxr"]
        for door_type in door_types:
            if door_type in sku.lower():
                filename += "-" + door_type

    # If the system is MG300 or MG350 and the width is 106 or 110, add '-3panels'
    if sku_parts[0].lower() in ["mg300", "mg350"] and any(
        x in sku for x in ["106", "110"]
    ):
        filename += "-3panels"

    filename += ".png"

    return filename


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)


@register.filter
def decode_sku_filter(sku):
    decoded_sku = decode_sku(sku)
    html = '<pre style="background-color: #f2f2f2; padding: 10px;">'
    for key, value in decoded_sku.items():
        html += f"{key}: {value}<br>"
    html += "</pre>"
    return mark_safe(html)


@register.filter
def multiply(value, arg):
    return value * arg
