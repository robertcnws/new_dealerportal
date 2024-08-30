import copy
import logging
import json
from .models import (
    Quote, 
    User, 
    QuoteProduct, 
    Order, 
    DealerAccount, 
    ItemGroup, 
    Product
)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.forms.models import model_to_dict
from django.db import models
from django.contrib import messages
from .forms import (
    QuoteForm,
    QuoteProductForm,
    UserForm,
    MyUserCreationForm,
    DealerAccountForm,
    QuoteNotesForm,
)
from django.http import HttpResponse, HttpResponseRedirect
from base.decorators import role_required
from django.db.models import Count, Sum, Count, Case, When, IntegerField
from .utilities import calculate_user_stats
from django.db import transaction
from django.http import JsonResponse
from notifications.views import create_notification
from zoho_api.views import sync_order_to_zoho

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.conf import settings
from datetime import datetime
from utils.views import encode_sku, suggest_similar_products
from utils.models import Invitation

from django.contrib.auth.views import PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail, EmailMessage
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.forms import AuthenticationForm
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# USER MANAGMENT VIEWS AND FUNCTIONS

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def loginPage(request):
    page = "login"

    if request.user.is_authenticated:
        return redirect("base-home")

    form = AuthenticationForm(request, data=request.POST or None)

    if request.method == "POST":
        if form.is_valid():
            user = form.get_user()

            # Check if the user is active
            if not user.is_active:
                messages.error(
                    request,
                    "Your account is inactive. Please contact your Dealer admin to activate it.",
                    extra_tags="error",
                )
                return redirect("base-login")

            login(request, user)
            return redirect("base-home")

    context = {"page": page, "form": form}
    return render(request, "base/login_register.html", context)


@login_required(login_url="base-login")
def logoutUser(request):
    logout(request)
    return redirect("base-login")


def registerPage(request):
    page = "register"
    form = MyUserCreationForm()

    if request.user.is_authenticated:
        return redirect("base-home")

    if request.method == "POST":
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()

            login(request, user)
            messages.success(request, "Account was created for " + user.username)
            return redirect("base-login")
        else:
            messages.error(request, "Error creating account.")

    context = {"page": page, "form": form}
    return render(request, "base/login_register.html", context)


# USER PROFILE AND SECURITY VIEWS AND FUNCTIONS
@login_required(login_url="base-login")
def myProfile(request):
    user = request.user
    form = UserForm(instance=user)
    context = {"user": user, "form": form}
    return render(request, "base/myprofile.html", context)


@login_required(login_url="base-login")
def updateProfile(request):
    if request.method == "POST":
        user = request.user
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            messages.success(request, "Profile updated successfully.")
            return redirect("base-myprofile")
    else:
        return redirect("base-myprofile")


def update_profile_pic(request):
    if request.method == "POST":
        user = request.user  # Directly reference the user from the request
        user.profile_pic = request.FILES["profile_pic"]
        user.save()
        messages.success(request, "Profile picture updated successfully.")
        return redirect("base-myprofile")


@login_required(login_url="base-login")
def toggle_light_mode(request):
    user = request.user
    user.light_mode = not user.light_mode
    user.save()

    # Redirect to the previous page
    referer = request.META.get("HTTP_REFERER", "/")
    return redirect(referer)


@login_required(login_url="base-login")
def home(request):
        user = get_object_or_404(User, id=request.user.id)
        dealership = None
        quotes, quote_count = get_paginated_quotes(user, 0, 10)
        month = datetime.now().month  # get current month number
        month_name = datetime.now().strftime("%B")  # this will give you current month name
        user_stats = calculate_user_stats(user)

        if request.user.role != "AppAdmin" or "AppManager":
            dealership = request.user.dealer_account

        # We will get stats for both orders and quotes in single database calls
        # For Orders
        orders = user.get_orders_for_user().filter(created_at__month=month)
        order_status_counts = orders.values("status").annotate(count=Count("status"))
        orders_stats = orders.aggregate(
            total_orders=Count("id"),
            confirmed_orders=Count(
                Case(When(status="accepted", then=1), output_field=IntegerField())
            ),
            pending_orders=Count(
                Case(When(status="pending", then=1), output_field=IntegerField())
            ),
            total_sell_in_orders=Sum("total_cost") or 0,
        )

        # For Quotes
        quotes_stats = (
            user.get_quotes_for_user()
            .filter(created_at__month=month)
            .aggregate(
                total_quotes=Count("id"), total_sell_in_quotes=Sum("total_sell") or 0
            )
        )

        context = {
            "dealership": dealership,
            "quotes": quotes,
            "user_stats": user_stats,
            "active_page": "dashboard",
            "month_name": month_name,
            "total_quotes": quotes_stats["total_quotes"],
            "total_orders": orders_stats["total_orders"],
            "confirmed_orders": orders_stats["confirmed_orders"],
            "pending_orders": orders_stats["pending_orders"],
            "total_sell_in_quotes": quotes_stats["total_sell_in_quotes"],
            "total_sell_in_orders": orders_stats["total_sell_in_orders"],
        }

        return render(request, "base/home.html", context)

# QUOTES VIEWS AND FUNCTIONS


def get_paginated_quotes(user, start, length):
    quotes = user.get_quotes_for_user()
    quote_count = quotes.count()
    paginator = Paginator(quotes, length)
    page = (start // length) + 1

    try:
        paginated_quotes = paginator.page(page)
    except EmptyPage:
        paginated_quotes = []

    return paginated_quotes, quote_count


# def get_api_dealerportal_paginated_quotes(user, start, length):
#     quotes = user.get_api_dealerportal_quotes_for_user()
#     quote_count = len(quotes)
#     paginator = Paginator(quotes, length)
#     page = (start // length) + 1

#     try:
#         paginated_quotes = paginator.page(page)
#     except EmptyPage:
#         paginated_quotes = []

#     return paginated_quotes, quote_count


@login_required(login_url="base-login")
def quotes_ajax(request):
    user = request.user
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))

    paginated_quotes, quote_count = get_paginated_quotes(user, start, length)

    quote_list = []
    for quote in paginated_quotes:
        quote_list.append(
            {
                "created_at": quote.created_at.isoformat(),
                "status": quote.status,
                "id": quote.id,
                "name": quote.name,
                "dealer_account": quote.owner.dealer_account.name
                if quote.owner.dealer_account
                else "",
                "owner": str(quote.owner),  # serialize User object to string
                "total_sell": "${:,.2f}".format(quote.total_sell),
                "total_cost": "${:,.2f}".format(quote.total_cost),
                "updated_at": quote.updated_at.isoformat(),
                # Include other fields that you want in the table here...
            }
        )

    return JsonResponse(
        {
            "draw": draw,
            "recordsTotal": quote_count,
            "recordsFiltered": quote_count,
            "data": quote_list,
        }
    )


@login_required(login_url="base-login")
def quotes(request):
    user = request.user
    form = QuoteForm()
    # quotes, quote_count = get_paginated_quotes(user, 0, 10)

    context = {
        # "quotes": quotes,
        # "quote_count": quote_count,
        "form": form,
        "active_page": "quotes",
    }
    return render(request, "base/quotes.html", context)


@login_required(login_url="base-login")
def view_quote(request, pk):
    quote_id = pk
    quote = get_object_or_404(Quote, id=quote_id)

    # Check if the current user is the quote owner, quote owner's dealer admin, or an AppAdmin
    if quote.is_editable_by(request.user):
        quote_products = quote.get_products()
        quote.calculate_price()
        quoteform = QuoteForm(instance=quote)  # Initialize form with quote instance
        # Initialize notes form with quote instance
        notesform = QuoteNotesForm(instance=quote)

        is_product_in_stock = {}
        product_list = None
        if quote.status == "active":
            products = Product.objects.all()

            product_list = [
                {
                    "id": product.id,
                    "label": f"{product.name}",
                    "value": f"{product.name}",
                    "sku": product.sku,
                    "price": str(
                        product.price
                    ),  # Convert to string for JSON serialization
                    "stock": product.stock,
                    "description": product.description,
                }
                for product in products
            ]

            # replace 'active' with the value representing active status in your model
            is_product_in_stock = quote.is_product_in_stock()

        context = {
            "quote": quote,
            "quote_products": quote_products,
            "quoteform": quoteform,
            "notesform": notesform,
            "product_list": product_list,
            "is_product_in_stock": is_product_in_stock,
            "active_page": "quotes",
        }
        return render(request, "base/view_quote.html", context)
    else:
        messages.error(request, "You don't have permission to view this quote.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

# ADDING THE NOTES TO THE QUOTE VIA AJAX
def update_quote_notes(request, quote_id):
    quote = get_object_or_404(Quote, id=quote_id)

    # Check if the current user is the quote owner, quote owner's dealer admin, or an AppAdmin
    if not quote.is_editable_by(request.user):
        messages.error(request, "You don't have permission to edit this quote.")
        return JsonResponse({"error": "Permission denied"}, status=403)

    if request.method == "POST":
        form = QuoteNotesForm(request.POST, instance=quote)
        if form.is_valid():
            form.save()
            messages.success(request, "Notes added succsefully.")
            return redirect(request.META.get("HTTP_REFERER", "/"))
        else:
            return JsonResponse({"error": form.errors}, status=400)


@login_required(login_url="base-login")
def save_products_to_quote(request):
    if request.method == "POST":
        form = QuoteProductForm(request.POST)
        if form.is_valid():
            quote_id = form.cleaned_data["quote"]
            quote = get_object_or_404(Quote, id=quote_id)

            if quote.is_editable_by(request.user):
                product_list = form.cleaned_data["product_list"]
                for product_data in product_list:
                    product_id = product_data["id"]
                    product_quantity = product_data["quantity"]
                    product = get_object_or_404(Product, id=product_id)
                    QuoteProduct.objects.create(
                        quote=quote, product=product, quantity=product_quantity
                    )
                messages.success(request, "Quote products added successfully.")
                return redirect("base-view-quote", pk=quote.id)
            else:
                messages.error(request, "You don't have permission to edit this quote.")
        else:
            messages.error(request, "Error in form submission.")
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
def create_quote(request):
    form = QuoteForm()
    if request.method == "POST":
        form = QuoteForm(request.POST)
        if form.is_valid():
            quote = form.save(commit=False)
            quote.owner = request.user
            quote.save()
            messages.success(request, "Quote created successfully.")
            message = f"Estimate #{quote.id} created by {request.user.username}"

            create_notification(
                request.user.get_users_to_notify(), "estimate", message=message
            )

            return redirect("base-view-quote", pk=quote.id)
        else:
            messages.error(request, "Error creating quote.")
    else:
        messages.error(request, "Error creating quote.")
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
def create_smart_quote(request):
    if request.method == "POST":
        quote_name = request.POST["name"]
        quote_markup = request.POST["markup"]
        manufacturer = request.POST["manufacturer"]
        frame_color = request.POST["frame_color"]
        budget = request.POST["budget"]
        items = request.POST["items"].split(",")

        skus = []
        for item in items:
            skus.append(encode_sku(manufacturer, frame_color, budget, item))

        # Get all products from the database
        products = Product.objects.all()

        # Convert the products into a dictionary
        inventory = {
            product.sku: {"quantity": product.stock, "price": product.price}
            for product in products
        }

        # Create a new quote first with quote_name and quote_markup
        quote = Quote.objects.create(
            name=quote_name, markup=quote_markup, owner=request.user
        )

        # Iterate over all SKUs and their quantities
        for sku, qty in skus:
            # Call the suggestion function
            suggestions = suggest_similar_products(
                sku, inventory, manufacturer
            )  # Modified line

            if suggestions:
                # Get the top suggestion SKU, its quantity, and price
                top_suggestion_sku, suggestion_qty, price, _ = suggestions[
                    0
                ]  # Modified line

                # Create new quote product using top_suggestion_sku, qty, and price, and link it to the quote
                # Only if suggestion quantity is greater than or equal to required quantity
                if suggestion_qty >= qty:  # Modified line
                    product = get_object_or_404(Product, sku=top_suggestion_sku)
                    quote_product = QuoteProduct.objects.create(
                        quote=quote, product=product, quantity=qty
                    )
                    quote_product.save()
                else:
                    messages.error(
                        request,
                        f"Not enough stock for product with SKU {top_suggestion_sku}.",
                    )
                    continue

        messages.success(request, "Smart Quote created successfully.")
        message = f"Smart Quote #{quote.id} created by {request.user.username}"

        create_notification(
            request.user.get_users_to_notify(), "estimate", message=message
        )

        # Redirect to the newly created quote
        return redirect("base-view-quote", pk=quote.pk)

    messages.error(request, "Error creating smart quote.")
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@transaction.atomic
def clone_quote(request, pk):
    original_quote = get_object_or_404(Quote, pk=pk)

    if (
        not original_quote.is_editable_by(request.user)
        or original_quote.status != "active"
    ):
        messages.error(request, "You are not allowed to clone this quote.")
        return redirect(
            "base-view-quotes"
        )  # Redirect to the list of quotes or appropriate view

    cloned_quote = copy.copy(original_quote)
    cloned_quote.pk = None
    cloned_quote.name += " (Cloned)"
    cloned_quote.owner = request.user  # Set the owner to the current user
    cloned_quote.save()

    # Copy associated quote products
    for quote_product in original_quote.get_products():
        cloned_quote_product = copy.copy(quote_product)
        cloned_quote_product.pk = None
        cloned_quote_product.quote = cloned_quote
        cloned_quote_product.save()

    messages.success(request, "Quote cloned successfully.")
    return redirect("base-view-quote", pk=cloned_quote.id)


@login_required(login_url="base-login")
def update_quote(request, pk):
    quote = Quote.objects.get(id=pk)
    form = QuoteForm(instance=quote)

    if not quote.is_editable_by(request.user) or quote.status != "active":
        messages.error(request, "You are not allowed to edit this quote.")
        return redirect(
            "base-view-quotes"
        )  # Redirect to the list of quotes or appropriate view

    if request.method == "POST":
        form = QuoteForm(request.POST, instance=quote)
        if form.is_valid():
            form.save()
            messages.success(request, "Quote updated successfully.")
            return redirect("base-view-quote", pk=quote.id)
        else:
            messages.error(request, "Error updating quote.")

    return redirect("base-view-quote", pk=quote.id)


@login_required(login_url="base-login")
def delete_quote(request, pk):
    quote = Quote.objects.get(id=pk)

    if not quote.is_editable_by(request.user) or quote.status == "ordered":
        messages.error(request, "You are not allowed to delete this quote.")
        referer = request.META.get("HTTP_REFERER", "/")
        return HttpResponseRedirect(referer)

    # if request.method == 'POST':
    quote.delete()
    messages.success(request, "Quote deleted successfully.")
    message = f"Estimate #{quote.id} deleted by {request.user.username}"
    create_notification(request.user.get_users_to_notify(), "estimate", message=message)
    return redirect("base-view-quotes")

    # return render(request, 'base/delete.html', {'obj': quote})


@login_required(login_url="base-login")
def edit_quote_product(request, pk):
    quoteproduct = get_object_or_404(QuoteProduct, pk=pk)

    # Check if the quote is editable by the current user and if the status is not ordered
    if (
        not quoteproduct.quote.is_editable_by(request.user)
        or quoteproduct.quote.status == "ordered"
    ):
        messages.error(request, "Error editing the item.")
        referer = request.META.get("HTTP_REFERER", "/")
        return HttpResponseRedirect(referer)

    if request.method == "POST":
        new_qty = request.POST.get("qty")

        if new_qty is not None:
            try:
                quoteproduct.quantity = new_qty
                quoteproduct.save()
                messages.success(request, "Item edited successfully.")
            except:
                messages.error(request, "Error editing the item.")

    referer = request.META.get("HTTP_REFERER", "/")
    return HttpResponseRedirect(referer)


# REPLACE THE ITEM ON THE QUOTE PLEASE
@login_required(login_url="base-login")
def replace_item_in_quote(request):
    if request.method == "POST":
        quote_id = request.POST.get("quote_id")
        quote_product_id = request.POST.get("quote_product_id")
        replacement_sku = request.POST.get("replacement_sku")

        quote = get_object_or_404(Quote, id=quote_id)

        if not quote.is_editable_by(request.user) or quote.status == "ordered":
            messages.error(
                request,
                f"Error replacing the item in quote {quote_id}. You may not have permission to edit it or the quote is already ordered.",
            )
            referer = request.META.get("HTTP_REFERER", "/")
            return HttpResponseRedirect(referer)

        if quote.replace_product(quote_product_id, replacement_sku):
            messages.success(
                request,
                f"Item replaced successfully in quote. The replacement SKU is {replacement_sku}.",
            )
        else:
            messages.error(
                request,
                f"Error replacing the item in quote . Please check the SKU or availability of the product.",
            )

    referer = request.META.get("HTTP_REFERER", "/")
    return HttpResponseRedirect(referer)


@login_required(login_url="base-login")
def delete_quote_product(request, pk):
    quote_product = QuoteProduct.objects.get(id=pk)

    if (
        not quote_product.quote.is_editable_by(request.user)
        or quote_product.quote.status == "ordered"
    ):
        messages.error(request, "Error removing the item.")
        referer = request.META.get("HTTP_REFERER", "/")
        return HttpResponseRedirect(referer)

    # if request.method == 'POST':

    try:
        quote_product.delete()
        messages.success(request, "Item removed successfully.")
        return redirect("base-view-quote", pk=quote_product.quote.id)
    except:
        messages.error(request, "Error removing the item.")
        return redirect("base-view-quote", pk=quote_product.quote.id)

    # return render(request, 'base/delete.html', {'obj': quote_product})


# ORDERS VIEWS AND FUNCTIONS


def get_paginated_orders(user, start, length):
    orders = user.get_orders_for_user()
    order_count = orders.count()
    paginator = Paginator(orders, length)
    page = (start // length) + 1

    try:
        paginated_orders = paginator.page(page)
    except EmptyPage:
        paginated_orders = []

    return paginated_orders, order_count


@login_required(login_url="base-login")
def orders(request):
    # user = request.user
    # orders, order_count = get_paginated_orders(user, 0, 10)
    context = {
        #    "orders": orders,
        #   "order_count": order_count,
        "active_page": "orders",
    }
    return render(request, "base/orders.html", context)


@login_required(login_url="base-login")
def orders_ajax(request):
    user = request.user
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))

    paginated_orders, order_count = get_paginated_orders(user, start, length)

    order_list = []
    for order in paginated_orders:
        order_list.append(
            {
                "created_at": order.created_at.isoformat(),
                "status": order.status,
                "id": order.id,
                "quote_name": order.quote.name,
                "quote_id": order.quote.id,
                "dealer_account": order.owner.dealer_account.name
                if order.owner.dealer_account
                else "",
                "owner": str(order.owner),  # serialize User object to string
                "total_sell": "${:,.2f}".format(order.quote.total_sell),
                "total_cost": "${:,.2f}".format(order.total_cost),
                "updated_at": order.updated_at.isoformat(),
                # Include other fields that you want in the table here...
            }
        )

    return JsonResponse(
        {
            "draw": draw,
            "recordsTotal": order_count,
            "recordsFiltered": order_count,
            "data": order_list,
        }
    )


@login_required(login_url="base-login")
def view_order(request, pk):
    order = Order.objects.get(id=pk)
    if not order.quote.is_editable_by(request.user):
        return HttpResponse("You are not allowed to view this Order.")

    context = {
        "order": order,
        "quote_products": order.quote.get_products(),
        "active_page": "orders",
    }
    return render(request, "base/view_order.html", context)


@login_required(login_url="base-login")
def create_order(request, pk):
    quote = Quote.objects.get(id=pk)

    if request.user.role != "DealerAdmin":
        messages.error(request, "You dont have permission to create orders.")
        return redirect("base-view-quote", pk=quote.id)

    if quote.get_products().count() == 0:
        messages.error(request, "Cannot create order from empty quote.")
        return redirect("base-view-quote", pk=quote.id)

    if not quote.is_editable_by(request.user) or quote.status == "ordered":
        messages.error(request, "Cannot create order from this quote.")
        return redirect("base-view-quote", pk=quote.id)

    if request.method == "POST":
        order = Order(quote=quote)
        order.owner = request.user
        order.total_cost = quote.total_cost
        order.save()
        quote.status = "ordered"
        quote.save()
        messages.success(request, "Order created successfully.")
        message = f"Estimate #{quote.id} ordered by {request.user.username}"
        create_notification(
            request.user.get_users_to_notify(), "order", message=message
        )
        # SENDING ORDER TO ZOHO API INVENTORY
        success, message = sync_order_to_zoho(order)
        if success:
            messages.success(request, message)
        else:
            messages.error(request, message)

        return redirect("base-view-order", pk=order.id)
    else:
        messages.success(request, "Error placing the Order.")
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager"])
def order_status_update(request):
    if request.method == "POST":
        try:
            order_id = request.POST["id"]
            new_status = request.POST["status"]
            order = get_object_or_404(Order, id=order_id)
            order.status = new_status
            order.save()
            messages.success(request, f"Order {order_id} status updated successfully!")
            message = f"Order #{order_id} ordered by {request.user.username}"
            create_notification(
                request.user.get_users_to_notify(), "order", message=message
            )
        except Exception as e:
            messages.error(request, f"Error updating order {order_id}: {str(e)}")
        finally:
            return redirect(request.META.get("HTTP_REFERER", "/"))
    else:
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
def delete_order(request, pk):
    order = Order.objects.get(id=pk)

    if (
        not order.quote.is_editable_by(request.user)
        or order.quote.status == "ordered"
        or order.status != "canceled"
    ):
        messages.error(request, "You are not allowed to delete this Order.")
        referer = request.META.get("HTTP_REFERER", "/")
        return HttpResponseRedirect(referer)

    if request.method == "POST":
        order.delete()
        messages.success(request, "Order deleted successfully.")
        return redirect("base-view-orders")

    return render(request, "base/delete.html", {"obj": order})


# PRODUCTS VIEWS AND FUNCTIONS
@login_required(login_url="base-login")
def check_stock(request):
    item_groups = ItemGroup.objects.all()
    context = {"item_groups": item_groups, "active_page": "stock"}
    return render(request, "base/check_stock.html", context)

# MANAGE DEALERS AND ESTIMATORS


@login_required(login_url="base-login")
def manageUser(request, pk):
    try:
        mange_user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return HttpResponse("User does not exist.")

    form = UserForm(instance=mange_user)

    if request.method == "POST":
        form = UserForm(request.POST, instance=mange_user)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            messages.success(request, "Profile updated successfully.")
            return redirect("base-manage-dealers")

    context = {"form": form, "manage_user": mange_user}
    return render(request, "base/manage_user.html", context)


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager"])
def manageDealers(request):
    dealerships = DealerAccount.objects.all()
    form = DealerAccountForm()
    context = {
        "dealerships": dealerships,
        "form": form,
        "active_page": "dealerships",
    }
    return render(request, "base/dealers.html", context)


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager"])
def createDealership(request):
    form = DealerAccountForm()
    if request.method == "POST":
        form = DealerAccountForm(request.POST)
        if form.is_valid():
            dealer = form.save(commit=False)
            dealer.save()
            messages.success(request, "Dealership created successfully.")
            return redirect("base-manage-dealers")

    messages.error(request, "Error Creating Dealership Account")
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
def manageDealership(request, pk):
    try:
        dealership = DealerAccount.objects.get(pk=pk)
    except DealerAccount.DoesNotExist:
        messages.error(request, "Dealer account does not exist.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if the user has permission to manage the dealership
    if dealership.allowed_to_manage(request.user):
        estimators = dealership.get_estimators()
        estimator_form = MyUserCreationForm()
        dealership_form = DealerAccountForm(instance=dealership)
        # Fetch the pending invitations for this dealership
        pending_invitations = Invitation.objects.filter(
            dealership=dealership, is_accepted=False
        )
        context = {
            "estimators": estimators,
            "dealership": dealership,
            "estimator_form": estimator_form,
            "dealership_form": dealership_form,
            "dealership_admin": dealership.dealer_admin,
            "active_page": "dealerships",
            "pending_invitations": pending_invitations,  # Add the pending invitations to the context
        }
        return render(request, "base/manage_dealership.html", context)
    else:
        messages.error(request, "You are not allowed here")
        return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
def updateDealershipDetails(request, pk):
    if request.method == "POST":
        try:
            dealership = DealerAccount.objects.get(pk=pk)
        except DealerAccount.DoesNotExist:
            messages.error(request, "Dealer account does not exist.")
            return redirect(request.META.get("HTTP_REFERER", "/"))

        dealership_form = DealerAccountForm(
            request.POST, request.FILES, instance=dealership
        )
        if dealership_form.is_valid():
            dealership_form.save()
            messages.success(request, "Dealership details updated successfully.")
            return redirect(
                "base-update-dealership-details", pk=pk
            )  # assuming the name of your view is 'manageDealershipDetails'
        else:
            messages.error(
                request,
                "Error updating dealership details. Please correct the errors and try again.",
            )
            return redirect(request.META.get("HTTP_REFERER", "/"))

    # Redirect to referrer or homepage if the request is not POST
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager"])
def manageDealershipStatus(request, pk):
    try:
        dealer_account = DealerAccount.objects.get(id=pk)
    except DealerAccount.DoesNotExist:
        messages.error(request, "Dealer account does not exist.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    user = User.objects.get(id=pk)

    if not request.user.allowed_to_manage(user):
        messages.error(request, "You do not have permission to deactivate this user.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    dealer_account.is_active = not dealer_account.is_active
    dealer_account.save()

    if not dealer_account.is_active:
        associated_users = User.objects.filter(dealer_account=dealer_account, is_active=True)
        for user in associated_users:
            user.is_active = False
            user.save()

    if not user.is_active:
        messages.error(request, "You do not have permission to deactivate this user.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    if user.role == "DealerAdmin":
        User.objects.filter(dealer_admin=user).update(is_active=False)

    action = "activated" if dealer_account.is_active else "deactivated"
    messages.success(request, f"Dealer account and associated users have been {action}.")
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
def manageDealershipUserStatus(request, pk):
    try:
        user_to_manage = User.objects.get(id=pk)
    except User.DoesNotExist:
        messages.error(request, "An error occurred.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if the user has permission to manage users
    if not request.user.allowed_to_manage(user_to_manage):
        messages.error(request, "You do not have permission to perform this operation.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Check if the user's DealerAdmin is active
    if not user_to_manage.dealer_account.is_active:
        messages.error(
            request, "Cannot activate user status. The Dealer Account is inactive."
        )
        return redirect(request.META.get("HTTP_REFERER", "/"))

    # Toggle the user status
    user_to_manage.is_active = not user_to_manage.is_active
    user_to_manage.save()

    if user_to_manage.role == "DealerAdmin":
        if not user_to_manage.is_active:
            User.objects.filter(
                dealer_account=user_to_manage.dealer_account, role="Estimator"
            ).update(is_active=False)
            # Activate all estimators if the user is a DealerAdmin and is being activated
            # User.objects.filter(dealer_account=user_to_manage.dealer_account, role='Estimator').update(is_active=True)
        # else:
        # Deactivate all estimators if the user is a DealerAdmin and is being deactivated

    action = "activated" if user_to_manage.is_active else "deactivated"
    messages.success(request, f"User has been {action}.")
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager"])
def manageDealerAdminUser(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        messages.error(request, "An error occurred performing this action")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    dealer_account = user.dealer_account
    if request.method == "POST":
        # check if there is already an active DealerAdmin for this DealerAccount
        dealer_admin_count = (
            User.objects.filter(
                dealer_account=dealer_account, role="DealerAdmin", is_active=True
            )
            .exclude(id=pk)
            .count()
        )
        if dealer_admin_count > 10:
            messages.error(request, "You have reached the Max Number of Admins Allowed.")
            return redirect(request.META.get("HTTP_REFERER", "/"))

        if user.role == "DealerAdmin":
            user.role = "Estimator"
            messages.success(request, "User role updated to Estimator successfully.")
        else:
            user.role = "DealerAdmin"
            messages.success(request, "User role updated to Dealer Admin successfully.")
            user.is_active = True
        user.save()
    return redirect(request.META.get("HTTP_REFERER", "/"))


@login_required(login_url="base-login")
@role_required(["AppAdmin", "AppManager", "DealerAdmin"])
def createEstimator(request, pk):
    try:
        dealer_account = DealerAccount.objects.get(id=pk)
    except DealerAccount.DoesNotExist:
        messages.error(request, "Dealer account does not exist.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    if (
        not dealer_account.allowed_to_manage(request.user)
        or dealer_account.is_active == False
    ):
        messages.error(request, "You are not allowed to manage this Dealership.")
        return redirect(request.META.get("HTTP_REFERER", "/"))

    if request.method == "POST":
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.role = "Estimator"
            user.dealer_account = dealer_account
            user.save()
            messages.success(request, "Estimator created successfully.")
            return redirect("base-manage-dealership", pk=dealer_account.id)
        else:
            messages.error(
                request, "Error creating the Estimator Please check the fields again."
            )
            return redirect("base-manage-dealership", pk=dealer_account.id)

    messages.error(request, "Error creating Estimator.")
    return redirect("base-manage-dealership", pk=dealer_account.id)


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
    
def custom_model_to_dict(instance):
    data = model_to_dict(instance)
    # Reemplaza los campos ImageFieldFile con el nombre del archivo
    for field in instance._meta.fields:
        if isinstance(field, models.ImageField):
            image_field = getattr(instance, field.name)
            data[field.name] = image_field.name if image_field else None
    return data


# PASSWORD RESET VIEWS AND FUNCTIONS

def password_reset_request(request):
    if request.method == "POST":
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get("email")
            associated_users = User.objects.filter(email=email)
            if associated_users.exists():
                for user in associated_users:
                    subject = "Password Reset Requested"
                    email_template_name = "base/password_reset/password_reset_email.html"
                    c = {
                        "email": user.email,
                        "domain": request.META['HTTP_HOST'],
                        "site_name": "Your Site",
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "user": user,
                        "token": default_token_generator.make_token(user),
                        "protocol": "https" if request.is_secure() else "http",
                    }
                    email_body = render_to_string(email_template_name, c)
                    
                    send_mail(
                        subject=subject, 
                        message=None, 
                        from_email=settings.DEFAULT_FROM_EMAIL, 
                        recipient_list=[user.email], 
                        fail_silently=False, 
                        html_message=email_body
                    )
            return redirect(reverse('password_reset_done'))
    else:
        form = PasswordResetForm()
    return render(request, "base/password_reset/password_reset_form.html", {"form": form})


def password_reset_confirm(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == "POST":
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                return redirect(reverse('password_reset_complete'))
        else:
            form = SetPasswordForm(user)
        return render(request, "base/password_reset/password_reset_confirm.html", {"form": form})
    else:
        return render(request, "base/password_reset/password_reset_invalid.html")
    

def password_reset_invalid(request):
    return render(request, "base/password_reset/password_reset_invalid.html")

class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'base/password_reset/password_reset_done.html'

class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'base/password_reset/password_reset_complete.html'
    

# API VIEWS AND FUNCTIONS

@csrf_exempt
def apiDealerportalLoginPage(request):

    if request.method == 'POST':
        try:
            data = json.loads(request.body)  
            username = data.get('username')  
            password = data.get('password') 
            if not username or not password:
                return JsonResponse({'error': 'Username and password required', 'description': 'Username and password required'}, status=400)
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                logger.info(f'User {username} logged in')
                return JsonResponse({
                    'data': custom_model_to_dict(user)
                }, status=200)
            login_user = User.objects.filter(username=username).first()
            if login_user:
                return JsonResponse({'error': 'Invalid credentials', 'description' : 'Incorrect Password'}, status=400)
            else:
                return JsonResponse({'error': 'Invalid credentials', 'description' : 'Username does not exist'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON', 'description': 'Request is not in a valid format'}, status=400)
    return JsonResponse({'error': 'Method not allowed', 'description': 'Method not allowed'}, status=405)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def apiDealerportalHome(request):
    valid_token = validateJWTTokenRequest(request)  
    if valid_token:
        user_id = request.GET.get('user_id')
        user = get_object_or_404(User, id=user_id)
        dealership = None
        quotes = user.get_api_dealerportal_quotes_for_user()[:10]
        month = datetime.now().month  # get current month number
        month_name = datetime.now().strftime("%B")  # this will give you current month name
        user_stats = calculate_user_stats(user)

        if request.user.role != "AppAdmin" or "AppManager":
            dealership = request.user.dealer_account

        # We will get stats for both orders and quotes in single database calls
        # For Orders
        orders = user.get_orders_for_user().filter(created_at__month=month)
        order_status_counts = orders.values("status").annotate(count=Count("status"))
        orders_stats = orders.aggregate(
            total_orders=Count("id"),
            confirmed_orders=Count(
                Case(When(status="accepted", then=1), output_field=IntegerField())
            ),
            pending_orders=Count(
                Case(When(status="pending", then=1), output_field=IntegerField())
            ),
            total_sell_in_orders=Sum("total_cost") or 0,
        )

        # For Quotes
        quotes_stats = (
            user.get_quotes_for_user()
            .filter(created_at__month=month)
            .aggregate(
                total_quotes=Count("id"), total_sell_in_quotes=Sum("total_sell") or 0
            )
        )

        # # Serialize quotes to make them JSON serializable
        # serialized_quotes = [model_to_dict(quote) for quote in quotes]
        
        # print(serialized_quotes)

        context = {
            "dealership": dealership,
            "quotes": quotes,
            "user_stats": user_stats,
            "active_page": "dashboard",
            "month_name": month_name,
            "total_quotes": quotes_stats["total_quotes"],
            "total_orders": orders_stats["total_orders"],
            "confirmed_orders": orders_stats["confirmed_orders"],
            "pending_orders": orders_stats["pending_orders"],
            "total_sell_in_quotes": quotes_stats["total_sell_in_quotes"],
            "total_sell_in_orders": orders_stats["total_sell_in_orders"],
        }

        return JsonResponse({ 'data': context }, status=200)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)
	

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def apiDealerportalListQuotes(request):
    valid_token = validateJWTTokenRequest(request)  
    if valid_token:
        user_id = request.GET.get('user_id')
        user = get_object_or_404(User, id=user_id)
        quotes = user.get_api_dealerportal_quotes_for_user()
        return JsonResponse({ 'data': quotes }, status=200)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)
	

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dealerportal_view_quote_products(request, pk):
    valid_token = validateJWTTokenRequest(request)  
    if valid_token:
        quote_id = pk
        quote = get_object_or_404(Quote, id=quote_id)
        user_id = request.GET.get('user_id')
        user = get_object_or_404(User, id=user_id)  

        # Check if the current user is the quote owner, quote owner's dealer admin, or an AppAdmin
        if quote.is_editable_by(user):
            list_quote_products = []
            quote_products = QuoteProduct.objects.filter(quote=quote).select_related('product').order_by('id')
            quote.calculate_price()

            is_product_in_stock = {}
            if quote.status == "active":

                # replace 'active' with the value representing active status in your model
                is_product_in_stock = quote.is_product_in_stock()
            
            for quote_product in quote_products:
                product = custom_model_to_dict(quote_product.product)
                product['id_quote_product'] = quote_product.id
                product['is_in_stock'] = is_product_in_stock.get(quote_product.product.name, '')
                product['quantity'] = quote_product.quantity
                list_quote_products.append(product)
            
            data = {
                'quote': custom_model_to_dict(quote),
                'quote_products': list_quote_products,
            }
            return JsonResponse({ 'data': data }, status=200)
        else:
            messages.error(request, "You don't have permission to view this quote.")
            return JsonResponse({'error': 'Permission denied', 'description': 'You do not have permission to view this quote'}, status=403)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)
	

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dealerportal_check_stock(request):
    valid_token = validateJWTTokenRequest(request)  
    if valid_token:     
        item_groups = ItemGroup.objects.all()
        list_of_item_groups = []
        for item_group in item_groups:
            list_of_item_groups.append(custom_model_to_dict(item_group))
        for item_group in list_of_item_groups:
            items = Product.objects.filter(zoho_group=item_group['id'])
            list_of_items = []
            for item in items:
                list_of_items.append(custom_model_to_dict(item))
            item_group['items'] = list_of_items
        return JsonResponse({'data': list_of_item_groups}, status=200)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)
	
	
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dealerportal_get_products(request):
    valid_token = validateJWTTokenRequest(request)  
    if valid_token: 
        status = request.GET.get('status', 'inactive')
        list_products = []
        if status == 'active':
            products = Product.objects.all().select_related('zoho_group').order_by('name')     
            for product in products:
                list_products.append(custom_model_to_dict(product))
        return JsonResponse({'data': list_products}, status=200)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_dealerportal_manage_product_to_quote(request):
    valid_token = validateJWTTokenRequest(request) 
    if valid_token:
        data = json.loads(request.body)
        quote_id = data.get('quote_id')
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        user_id = data.get('user_id')
        quote_product_id = data.get('quote_product_id', None)
        is_deletion = data.get('is_deletion', False)
        user = get_object_or_404(User, id=user_id)
        quote = get_object_or_404(Quote, id=quote_id)
        product = get_object_or_404(Product, id=product_id)
        data = {}   
        if quote.is_editable_by(user):
            quote_product, quote_product_return = None, None
            if not quote_product_id:
                quote_product = QuoteProduct.objects.create(quote=quote, product=product, quantity=quantity)
                quote_product_return = custom_model_to_dict(quote_product)
            elif quote_product_id and not is_deletion:
                quote_product = get_object_or_404(QuoteProduct, id=quote_product_id)
                quote_product.quantity = quantity
                quote_product.save()
                quote_product_return = custom_model_to_dict(quote_product)  
            elif quote_product_id and is_deletion:
                quote_product = get_object_or_404(QuoteProduct, id=quote_product_id)
                quote_product.delete()
                quote_product_return = None
            quote.calculate_price()
            quote_return = custom_model_to_dict(quote)
            data = {
                'quote': quote_return,
                'quote_product': quote_product_return
            }
            return JsonResponse({'data': data}, status=200)
        else:
            return JsonResponse({'error': 'Permission denied', 'description': 'You do not have permission to add product to this quote'}, status=403)
    return JsonResponse({'error': 'Invalid token', 'description': 'Invalid Token for this request'}, status=401)

    
