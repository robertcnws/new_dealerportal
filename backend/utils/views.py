# Django imports
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.template.loader import get_template
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib import messages
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.db import transaction
from django.core.mail import EmailMessage

from django.template.loader import render_to_string
from base.decorators import role_required

# TO THE EQUALIZE QUOTE METHOD
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import fractions
import re

from collections import Counter

# Base app imports
from base.models import Quote, Product, ItemGroup, Order, DealerAccount, User
from base.forms import MyUserInvitedForm
from django.db.models import Q
from notifications.views import create_notification

# Local imports
from .models import Invitation
from .search import search

# Other third-party imports
from xhtml2pdf import pisa
from dateutil import parser
from datetime import timezone


# Create your views here.


@login_required(login_url="base-login")
def quote_render_pdf_view(request, pk):
    template_path = "utils/quote_pdf.html"
    quote = Quote.objects.select_related("owner__dealer_account").get(pk=pk)
    dealership = quote.owner.dealer_account  # remove parentheses

    quote_products = quote.get_products()

    context = {
        "quote": quote,
        "quote_products": quote_products,
        "dealership": dealership,
    }
    # Create a Django response object, and specify content_type as pdf
    response = HttpResponse(content_type="application/pdf")
    # if download:
    # response['Content-Disposition'] = 'attachment; filename="report.pdf"'
    # if display
    response["Content-Disposition"] = 'filename="report.pdf"'
    # find the template and render it.
    template = get_template(template_path)
    html = template.render(context)

    # create a pdf
    pisa_status = pisa.CreatePDF(html, dest=response)
    # if error then show some funny view
    if pisa_status.err:
        return HttpResponse("We had some errors <pre>" + html + "</pre>")
    return response


@login_required(login_url="base-login")
def quote_render_cost_pdf_view(request, pk):
    template_path = "utils/quote_pdf_cost_sell.html"
    quote = Quote.objects.select_related("owner__dealer_account").get(pk=pk)
    dealership = quote.owner.dealer_account  # remove parentheses

    quote_products = quote.get_products()

    context = {
        "quote": quote,
        "quote_products": quote_products,
        "dealership": dealership,
    }
    # Create a Django response object, and specify content_type as pdf
    response = HttpResponse(content_type="application/pdf")
    # if download:
    # response['Content-Disposition'] = 'attachment; filename="report.pdf"'
    # if display
    response["Content-Disposition"] = 'filename="report.pdf"'
    # find the template and render it.
    template = get_template(template_path)
    html = template.render(context)

    # create a pdf
    pisa_status = pisa.CreatePDF(html, dest=response)
    # if error then show some funny view
    if pisa_status.err:
        return HttpResponse("We had some errors <pre>" + html + "</pre>")
    return response


@login_required(login_url="base-login")
def quote_download_pdf_view(request, pk):
    template_path = "utils/quote_pdf.html"
    quote = Quote.objects.select_related("owner__dealer_account").get(pk=pk)
    dealership = quote.owner.dealer_account  # remove parentheses

    quote_products = quote.get_products()

    context = {
        "quote": quote,
        "quote_products": quote_products,
        "dealership": dealership,
    }
    # Create a Django response object, and specify content_type as pdf
    response = HttpResponse(content_type="application/pdf")
    # if download:
    response["Content-Disposition"] = (
        'attachment; filename="Est-#' + str(quote.id) + '.pdf"'
    )

    # if display
    # response['Content-Disposition'] = 'filename="report.pdf"'
    # find the template and render it.
    template = get_template(template_path)
    html = template.render(context)

    # create a pdf
    pisa_status = pisa.CreatePDF(html, dest=response)
    # if error then show some funny view
    if pisa_status.err:
        return HttpResponse("We had some errors <pre>" + html + "</pre>")
    return response


@login_required(login_url="base-login")
def render_pdf_view(request):
    template_path = "utils/quote_pdf.html"
    context = {"myvar": "this is your template context"}
    # Create a Django response object, and specify content_type as pdf
    response = HttpResponse(content_type="application/pdf")
    # if download:
    # response['Content-Disposition'] = 'attachment; filename="report.pdf"'
    # if display
    response["Content-Disposition"] = 'filename="report.pdf"'
    # find the template and render it.
    template = get_template(template_path)
    html = template.render(context)

    # create a pdf
    pisa_status = pisa.CreatePDF(html, dest=response)
    # if error then show some funny view
    if pisa_status.err:
        return HttpResponse("We had some errors <pre>" + html + "</pre>")
    return response


@login_required(login_url="base-login")
def search_view(request):
    query = request.GET.get("q", "")
    active_page = request.GET.get("active_page", "").lower()

    # Define the models for each active page
    page_models = {
        "stock": [Product, ItemGroup],
        "quotes": [Quote],
        "orders": [Order],
    }

    # Get the models to search based on the active_page parameter
    models_to_search = (
        page_models.get(active_page)
        if active_page in page_models
        and is_user_allowed_to_search_model(request.user, active_page)
        else [Product, Quote, Order]
    )

    results = search(query, models_to_search) if query else {}

    context = {
        "query": query,
        "results": results,
        "active_page": active_page,
    }

    return render(request, "utils/search_results.html", context)


def is_user_allowed_to_search_model(user, model_str):
    if not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    if model_str not in settings.ALLOWED_MODELS_TO_SEARCH:
        return False

    # Add additional custom permissions checks here if needed

    return True


# Util method to check if time1 is after time2


def is_after(time1, time2):
    """
    Returns True if time1 is after time2, else False.
    Both time1 and time2 can be either strings in ISO format or datetime objects.
    """
    if time2 is None:
        return True

    if isinstance(time1, str):
        time1 = parser.isoparse(time1)
    if isinstance(time2, str):
        time2 = parser.isoparse(time2)

    # If time1 or time2 is timezone-aware, convert them to UTC
    if time1.tzinfo is not None:
        time1 = time1.astimezone(timezone.utc).replace(tzinfo=None)
    if time2.tzinfo is not None:
        time2 = time2.astimezone(timezone.utc).replace(tzinfo=None)

    return time1 > time2


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
@require_POST
def send_invitation(request):
    email = request.POST.get("email")
    dealership_id = request.POST.get("dealership_id")
    role = request.POST.get("role")
    dealership = DealerAccount.objects.get(id=dealership_id) if dealership_id else None

    # Check the number of users associated with the dealership
    if dealership and dealership.users.count() >= 30:
        messages.error(
            request, "This dealership already has the maximum allowed number of users."
        )
        return redirect(request.META.get("HTTP_REFERER", "/"))

    try:
        invitation = Invitation.objects.get(email=email)
        if invitation.is_accepted:
            messages.error(
                request, "An account has already been created for this email."
            )
            return redirect(request.META.get("HTTP_REFERER", "/"))
        elif (
            dealership
            and invitation.dealership
            and invitation.dealership.id != dealership.id
        ):
            messages.error(
                request,
                "An invitation for this email already exists for a different dealership.",
            )
            return redirect(request.META.get("HTTP_REFERER", "/"))
        else:
            invitation.code = get_random_string(50)
            invitation.dealership = dealership
            invitation.role = role
    except Invitation.DoesNotExist:
        invitation = Invitation.objects.create(
            email=email, dealership=dealership, role=role
        )

    invitation.save()

    # Generate the invite link
    invite_url = request.build_absolute_uri(
        reverse("utils:utils-accept-invitation", kwargs={"code": invitation.code})
    )

    # Load and render the template for the email
    email_html_message = render_to_string(
        "utils/email_invitation.html",  # The name of your HTML template
        {"invite_url": invite_url},  # Any variables you want to use in your template
    )

    email_msg = EmailMessage(
        "Invitation to create an account",
        email_html_message,
        "dealers@newwindowsystem.com",
        [email],
    )
    email_msg.content_subtype = "html"  # It's an HTML email
    email_msg.send(fail_silently=False)

    messages.success(request, "Invitation sent successfully.")
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
def resend_invitation(request, invitation_id):
    try:
        # Get the invitation from the database
        invitation = Invitation.objects.get(id=invitation_id)
        if invitation.is_accepted:
            messages.error(
                request, "An account has already been created for this email."
            )
            return redirect(request.META.get("HTTP_REFERER", "/"))

        # Generate a new invite link
        invite_url = request.build_absolute_uri(
            reverse("utils:utils-accept-invitation", kwargs={"code": invitation.code})
        )

        # Load and render the template for the email
        email_html_message = render_to_string(
            "utils/email_invitation.html",
            {"invite_url": invite_url},
        )

        # Create the email
        email_msg = EmailMessage(
            "Invitation to create an account",
            email_html_message,
            "dealers@newwindowsystem.com",
            [invitation.email],
        )
        email_msg.content_subtype = "html"

        # Send the email
        email_msg.send(fail_silently=False)

        messages.success(request, "Invitation re-sent successfully.")
    except Invitation.DoesNotExist:
        messages.error(request, "The invitation does not exist.")

    return redirect(request.META.get("HTTP_REFERER", "/"))


def delete_invitation(request):
    invitation_id = request.POST.get("invitation_id")

    if not invitation_id or not invitation_id.isdigit():
        messages.error(
            request,
            "No valid invitation ID provided.",
        )
        return redirect(request.META.get("HTTP_REFERER", "/"))

    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        messages.error(
            request,
            "No invitation exists with the given ID.",
        )
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Delete the invitation
    invitation.delete()

    messages.success(request, "Invitation deleted successfully.")
    return redirect(request.META.get("HTTP_REFERER", "/"))


def accept_invitation(request, code):
    invitation = get_object_or_404(Invitation, code=code, is_accepted=False)
    form = MyUserInvitedForm(request.POST or None)

    if form.is_valid():
        with transaction.atomic():
            user = form.save(commit=False)
            user.username = user.username.lower()

            dealership = invitation.dealership
            if dealership and dealership.users.count() >= 30:
                messages.error(
                    request,
                    "This dealership already has the maximum allowed number of users.",
                )
                return redirect(request.META.get("HTTP_REFERER", "/"))

            if dealership is None and invitation.role != "K54Rl":
                messages.error(
                    request,
                    "Error: Invitation cannot be processed. It is not valid.",
                )
                return redirect(request.META.get("HTTP_REFERER", "/"))

            if dealership is not None:
                user.dealer_account = dealership
            if invitation.role == "K54Rl":
                user.role = "AppManager"
            user.light_mode = True
            user.save()

            invitation.user = user
            invitation.is_accepted = True
            invitation.save()

            # Send a message to the AppAdmin and Manager
            app_admins_and_managers = User.objects.filter(
                Q(role="AppAdmin") | Q(role="AppManager")
            )

            message = f"User {user.username} has accepted the invitation."
            if user.dealer_account is not None:
                message += f" From Dealership {user.dealer_account.name}."

            create_notification(
                app_admins_and_managers, "system_Alert", message=message
            )

        login(request, user)
        messages.success(
            request, "Welcome to New Window System Dealer Portal " + user.username
        )
        return redirect("base-login")

    context = {"invitation": invitation, "form": form}
    return render(request, "utils/accept_invitation.html", context)


def decode_sku(sku):
    # Split the SKU into its components
    components = sku.split(" ")

    # Dictionary to store the decoded values
    decoded_values = {}

    try:
        # Decode the manufacturer and model
        if len(components[0]) == 2:
            manufacturer = components[0]
            model = None
        else:
            manufacturer = (
                components[0][:3] if components[0][2].isalpha() else components[0][:2]
            )

            if components[0][3:] in ["SH", "PW", "HR"]:
                model = (
                    None  # Model doesn't exist, window type directly after manufacturer
                )
            else:
                model = (
                    components[0][3:]
                    if components[0][2].isalpha()
                    else components[0][2:]
                )

        decoded_values["Manufacturer"] = manufacturer
        decoded_values["Model"] = model if model else "N/A"  # 'N/A' if model is None

        # Decode the colors and window type
        if (
            components[1] == "PW"
            or components[1] == "SH"
            or components[1] == "FIXED"
            or components[1] == "HR"
        ):
            window_type = components[1]  # Window type is PW or SH
            decoded_values["Window Type"] = window_type
            del components[1]

        color_component = components[1]
        frame_color = color_component[0]
        glass_color = color_component[1]

        decoded_values["Frame Color"] = frame_color
        decoded_values["Glass Color"] = glass_color

        # Check if the SKU has privacy glass
        if len(color_component) > 2 and color_component[2] == "I":
            decoded_values["Privacy Glass"] = "Yes"
        else:
            decoded_values["Privacy Glass"] = "No"

        # Decode the door or window orientation if present
        if components[1] in ["XR", "XXR", "XL", "XXL", "XOX"]:
            decoded_values["Orientation"] = components[1]
            del components[1]  # Remove the orientation from components
        if components[2] in ["XR", "XXR", "XL", "XXL", "XOX"]:
            decoded_values["Orientation"] = components[2]
            del components[1]  # Remove the orientation from components

        size_component = " ".join(
            [c for c in components[2:] if re.match(r"^\d+|\d+\s\d+/\d+|[Xx]$", c)]
        )

        # Filter out unwanted characters

        # Decode the size
        size = re.split(r"[Xx]", size_component)
        try:
            width = size[0].strip()
            height = size[1].strip()
            # Convert the width and height to decimals
            width = fraction_to_decimal(width)
            height = fraction_to_decimal(height)
        except ValueError:
            width = 0
            height = 0

        decoded_values["Width (in inches)"] = width
        decoded_values["Height (in inches)"] = height

    except IndexError:
        # Handle the case when the SKU structure is not as expected
        decoded_values["Error"] = "Invalid SKU format"

    return decoded_values


def equalize_quote_analysis(quote):
    quote_products = quote.get_products()  # Retrieve all the quote products

    # Counters to store occurrences of each manufacturer and frame color
    manufacturers = Counter()
    frame_colors = Counter()

    # First pass to fill the counters
    for quote_product in quote_products:
        decoded_window = decode_sku(quote_product.product.sku)
        manufacturers[decoded_window.get("Manufacturer")] += 1
        frame_colors[decoded_window.get("Frame Color")] += 1

    # Find the most common manufacturer and frame color
    base_manufacturer = manufacturers.most_common(1)[0][0]
    base_frame_color = frame_colors.most_common(1)[0][0]

    # Initialize the results
    equalize_results = []

    # Second pass to find discrepancies
    for quote_product in quote_products:
        decoded_window = decode_sku(
            quote_product.product.sku
        )  # Get decoded values of the current window
        error_messages = []

        if base_frame_color != decoded_window.get("Frame Color"):
            error_messages.append("Different Frame Color")

        if base_manufacturer != decoded_window.get("Manufacturer"):
            error_messages.append("Different Manufacturer")

        # Only add the product to the results if there's at least one discrepancy
        if error_messages:
            equalize_results.append(
                {
                    "quote_product_id": quote_product.id,
                    "sku": quote_product.product.sku,
                    "errors": ", ".join(error_messages),
                }
            )
    return JsonResponse(equalize_results, safe=False)


@ensure_csrf_cookie
def equalize_quote_view(request, quote_id):
    quote = get_object_or_404(Quote, pk=quote_id)
    return equalize_quote_analysis(quote)


def suggest_similar_products(sku, inventory, user_choice=None):
    decoded_product = decode_sku(sku)  # Get decoded values of the current product
    width = fraction_to_decimal(decoded_product.get("Width (in inches)"))
    height = fraction_to_decimal(decoded_product.get("Height (in inches)"))
    manufacturer = decoded_product.get("Manufacturer")
    frame_color = decoded_product.get("Frame Color")

    # Find a replacement in the inventory
    suggestions = []
    for inventory_sku, product in inventory.items():
        # Skip the current SKU
        if inventory_sku == sku:
            continue

        decoded_inventory_product = decode_sku(inventory_sku)
        inventory_width = decoded_inventory_product.get("Width (in inches)")
        inventory_height = decoded_inventory_product.get("Height (in inches)")
        inventory_manufacturer = decoded_inventory_product.get("Manufacturer")
        inventory_frame_color = decoded_inventory_product.get("Frame Color")

        # Check if the product in inventory is from the same manufacturer, has the same frame color, and is within 3 inches of the original product
        if (
            inventory_frame_color == frame_color
            and (
                width is None
                or inventory_width is None
                or abs(inventory_width - width) <= 3
            )
            and (
                height is None
                or inventory_height is None
                or abs(inventory_height - height) <= 3
            )
            and inventory.get(inventory_sku, {}).get("quantity", 0) > 0
        ):
            # Add the suggestion to the list
            manufacturer_match = inventory_manufacturer == manufacturer
            quantity = inventory[inventory_sku]["quantity"]
            price = inventory[inventory_sku].get("price", 0)
            suggestions.append((inventory_sku, quantity, price, manufacturer_match))

    # Sort the suggestions based on whether they match the original product's manufacturer, prioritizing matches
    suggestions.sort(key=lambda x: x[3], reverse=True)

    # Record the suggestions and the user's choice
    record_suggestions(sku, [suggestion[0] for suggestion in suggestions], user_choice)

    return suggestions


import csv


def record_suggestions(sku, suggestions, user_choice):
    with open("suggestions.csv", "a", newline="") as file:
        writer = csv.writer(file)
        for suggestion in suggestions:
            writer.writerow([sku, suggestion, suggestion == user_choice])


def analyze_quote_and_suggest_replacements(quote, inventory):
    quote_products = quote.get_products()
    suggestions = {}

    for quote_product in quote_products:
        if inventory[quote_product.product.sku]["quantity"] < quote_product.quantity:
            replacements = suggest_similar_products(
                quote_product.product.sku, inventory
            )
            if replacements:
                suggestions[quote_product.product.sku] = {
                    "quote_product_id": quote_product.id,  # Include quote_product_id in suggestions
                    "original": {
                        "quantity": quote_product.quantity,
                        "price": quote_product.product.price,
                    },
                    "replacements": replacements,
                }

    return suggestions


def analyze_quote_and_suggest_replacements_view(request, quote_id):
    # Retrieve the quote from your database
    quote = get_object_or_404(Quote, id=quote_id)

    # Retrieve all products from your database
    products = Product.objects.all()

    # Convert the products into a dictionary
    inventory = {
        product.sku: {"quantity": product.stock, "price": product.price}
        for product in products
    }

    # Call the analyze_quote_and_suggest_replacements function
    suggestions = analyze_quote_and_suggest_replacements(quote, inventory)

    # Return the suggestions as a JSON response
    return JsonResponse(suggestions)


def fraction_to_decimal(fraction):
    if isinstance(fraction, (int, float)):
        return float(fraction)

    elif fraction is None:
        return 0

    elif isinstance(fraction, str):
        try:
            if " " in fraction:  # check if it's a mixed number string like '1 3/4'
                whole, frac = fraction.split(" ")
                num, denom = map(int, frac.split("/"))
                return float(int(whole) + num / denom)
            elif "/" in fraction:  # check if it's a fraction string like '3/4'
                num, denom = map(int, fraction.split("/"))
                return float(num / denom)
            else:  # it's a whole number string like '2'
                return float(fraction)
        except ValueError:
            return 0

    else:  # if the input is not an integer, float or string, return 0
        return 0


# Dictionaries for model mapping
model_mapping = {
    "mg": {
        "fd": "3000",
        "sgd": "1500",
        "hr": "300",
        "sh": "200",
        "casement": "600",
        "pw": "350",
    },
    "eco": {"fd": "600", "sgd": "700", "hr": "60"},
}

# Dictionaries for detecting key phrases
key_phrases = {
    "privacy": [
        "privacidad",
        "bath",
        "bano",
        "privado",
        "intimidad",
        "personal",
        "privacy",
    ],
    "french_door": [
        "fd",
        "french door",
        "puerta francesa",
        "puerta de francia",
        "puerta doble",
        "puerta bifurcada",
    ],
    "sliding_door": [
        "sgd",
        "sliding glass door",
        "puerta corrediza",
        "puerta deslizante",
        "puerta de vidrio deslizante",
    ],
    "horizontal_roller": [
        "hr",
        "horizontal roller",
        "rodillo horizontal",
        "ventana de rodillo",
        "ventana rodillo",
    ],
    "single_hung": [
        "sh",
        "single hung",
        "soltero colgado",
        "ventana colgada simple",
        "ventana de guillotina simple",
    ],
    "casement": [
        "ca",
        "casement",
        "ventana batiente",
        "ventana oscilante",
        "ventana abatible",
        "ventana de hojas",
    ],
    "picture_window": [
        "pw",
        "picture window",
        "ventana de imagen",
        "ventana panoramica",
        "ventana de cuadro",
    ],
    "left": ["let", "izquierda", "lado izquierdo", "left"],
    "right": ["right", "derecha", "lado derecho", "right"],
}


def extract_dimension(dimension_str):
    matches = re.findall(r"(\d+(\.\d+)?|\d+/\d+)", dimension_str)
    return matches[0][0] if matches else None


def encode_sku(manufacturer, frame_color, budget, item):
    manufacturer = manufacturer.lower()
    frame_color = frame_color.lower()
    budget = budget.lower()
    glass_color = "G"
    item = item.lower().strip()  # Convert item to lower case and remove trailing spaces
    privacy = ""  # Default privacy
    window_type = ""  # Default window type
    model = ""  # Default model

    # Check for quantity in item description
    quantity = re.search(r"\((\d+)\)|\[(\d+)\]|\{(\d+)\}", item)
    qty = 1  # Default quantity
    if quantity:
        qty = int(quantity.group(1) or quantity.group(2) or quantity.group(3))

    # Remove quantity from item description
    item = re.sub(r"\((\d+)\)|\[(\d+)\]|\{(\d+)\}", "", item)

    # Check for privacy
    if any(phrase in item for phrase in key_phrases["privacy"]):
        privacy = "i"

    # Split item to get size
    item_parts = re.split(r"[Xx]", item)

    try:
        width_str = extract_dimension(item_parts[0]) if len(item_parts) > 0 else None
        height_str = extract_dimension(item_parts[1]) if len(item_parts) > 1 else None

        # Convert the width and height to decimals
        width = float(width_str) if width_str else 0
        height = float(height_str) if height_str else 0
    except ValueError:
        width = 0
        height = 0

    # If window type and model not determined by key phrases, decide based on size
    if height <= 79:  # This is a window
        model = model_mapping.get(manufacturer, {}).get("hr", "")
    else:  # This is a door
        model = model_mapping.get(manufacturer, {}).get("fd", "")

    # Adjust the model if budget is 'economy' and model is '300'
    if budget == "economy" and model == "300":
        model = "350"

    # If window type not determined by key phrases, decide based on model
    if window_type == "" and model in ["350", "60"]:
        if any(phrase in item for phrase in key_phrases["single_hung"]):
            window_type = "sh"
        elif any(phrase in item for phrase in key_phrases["picture_window"]):
            window_type = "pw"

    # Construct the SKU
    if window_type != "":
        sku = f"{manufacturer}{model} {window_type} {frame_color}{glass_color}{privacy} {width} X {height}".upper()
    else:
        sku = f"{manufacturer}{model} {frame_color}{glass_color}{privacy} {width} X {height}".upper()

    return sku, qty
