from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Q
from django.utils import timezone
from django.db.models import Max
from django.forms.models import model_to_dict
import os
from django.conf import settings


def get_today():
    return timezone.now().date()


def get_yesterday():
    return get_today() - timezone.timedelta(days=1)


class User(AbstractUser):
    USER_ROLE_CHOICES = (
        ("AppAdmin", "AppAdmin"),
        ("AppManager", "AppManager"),
        ("DealerAdmin", "DealerAdmin"),
        ("Estimator", "Estimator"),
    )

    role = models.CharField(
        max_length=20,
        choices=USER_ROLE_CHOICES,
        null=True,
        blank=True,
        default="Estimator",
    )
    dealer_account = models.ForeignKey(
        "DealerAccount",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users",
    )
    light_mode = models.BooleanField(default=False)
    address = models.CharField(max_length=255, blank=True, null=True)
    profile_pic = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True, default="profile-pic.png"
    )

    REQUIRED_FIELDS = []

    def is_dealer_admin(self):
        return self.role == "DealerAdmin"

    def get_estimators(self):
        if self.role != "DealerAdmin":
            return User.objects.none()
        return User.objects.filter(dealer_account=self.dealer_account, role="Estimator")

    def get_quotes_for_user(self, quote_limit=None):
        if self.role == "AppAdmin" or self.is_superuser or self.role == "AppManager":
            queryset = Quote.objects.all()
        elif self.role == "Estimator":
            queryset = Quote.objects.filter(owner=self)
        elif self.role == "DealerAdmin":
            estimator_ids = self.get_estimators().values_list("id", flat=True)
            queryset = Quote.objects.filter(Q(owner=self) | Q(owner__in=estimator_ids))
        else:
            queryset = Quote.objects.none()

        if quote_limit is not None:
            queryset = queryset.order_by("-updated_at", "-created_at")[:quote_limit]
        else:
            queryset = queryset.order_by("-updated_at", "-created_at")
        return queryset
    
    def get_api_dealerportal_quotes_for_user(self, quote_limit=None):
        if self.role == "AppAdmin" or self.is_superuser or self.role == "AppManager":
            queryset = Quote.objects.all().select_related('owner', 'owner__dealer_account')
        elif self.role == "Estimator":
            queryset = Quote.objects.filter(owner=self).select_related('owner', 'owner__dealer_account')
        elif self.role == "DealerAdmin":
            estimator_ids = self.get_estimators().values_list("id", flat=True)
            queryset = Quote.objects.filter(Q(owner=self) | Q(owner__in=estimator_ids)).select_related('owner', 'owner__dealer_account')
        else:
            queryset = Quote.objects.none()

        if quote_limit is not None:
            queryset = queryset.order_by("-updated_at", "-created_at")[:quote_limit]
        else:
            queryset = queryset.order_by("-updated_at", "-created_at")
        serialized_quotes = []
        for quote in queryset:
            quote_dict = model_to_dict(quote)
            quote_dict['created_at'] = quote.created_at.strftime("%Y-%m-%d %H:%M:%S")
            quote_dict['updated_at'] = quote.updated_at.strftime("%Y-%m-%d %H:%M:%S")
            if quote.owner:
                owner_dict = model_to_dict(quote.owner, exclude=['password', 'profile_pic'])
                if quote.owner.profile_pic:
                    owner_dict['profile_pic_url'] = quote.owner.profile_pic.url  
                quote_dict['owner'] = owner_dict
                if quote.owner.dealer_account:
                    dealer_account_dict = model_to_dict(quote.owner.dealer_account, exclude=['logo'])
                    if quote.owner.dealer_account.logo:
                        dealer_account_dict['logo_url'] = quote.owner.dealer_account.logo.url
                    quote_dict['owner']['dealer_account'] = dealer_account_dict
            serialized_quotes.append(quote_dict)
        return serialized_quotes    

    def get_orders_for_user(self, order_limit=None):
        if self.role == "AppAdmin" or self.is_superuser or self.role == "AppManager":
            queryset = Order.objects.all()
        elif self.role == "Estimator":
            queryset = Order.objects.filter(owner=self)
        elif self.role == "DealerAdmin":
            estimator_ids = self.get_estimators().values_list("id", flat=True)
            queryset = Order.objects.filter(Q(owner=self) | Q(owner__in=estimator_ids))
        else:
            queryset = Quote.objects.none()

        if order_limit is not None:
            queryset = queryset.order_by("-updated_at", "-created_at")[:order_limit]
        else:
            queryset = queryset.order_by("-updated_at", "-created_at")

        return queryset
    
    
    def get_api_dealerportal_orders_for_user(self, order_limit=None):
        if self.role == "AppAdmin" or self.is_superuser or self.role == "AppManager":
            queryset = Order.objects.all().select_related(
                'owner', 'owner__dealer_account', 'quote', 'quote__owner', 'quote__owner__dealer_account'
            )
        elif self.role == "Estimator":
            queryset = Order.objects.filter(owner=self)
        elif self.role == "DealerAdmin":
            estimator_ids = self.get_estimators().values_list("id", flat=True)
            queryset = Order.objects.filter(Q(owner=self) | Q(owner__in=estimator_ids)).select_related(
                'owner', 'owner__dealer_account', 'quote', 'quote__owner', 'quote__owner__dealer_account'
            )
        else:
            queryset = Quote.objects.none()

        if order_limit is not None:
            queryset = queryset.order_by("-updated_at", "-created_at")[:order_limit]
        else:
            queryset = queryset.order_by("-updated_at", "-created_at")
        serialized_orders = []
        for order in queryset:
            order_dict = model_to_dict(order)
            order_dict['created_at'] = order.created_at.strftime("%Y-%m-%d %H:%M:%S")
            order_dict['updated_at'] = order.updated_at.strftime("%Y-%m-%d %H:%M:%S")
            if order.owner:
                owner_dict = model_to_dict(order.owner, exclude=['password', 'profile_pic'])
                if order.owner.profile_pic:
                    owner_dict['profile_pic_url'] = order.owner.profile_pic.url  
                order_dict['owner'] = owner_dict
                if order.owner.dealer_account:
                    dealer_account_dict = model_to_dict(order.owner.dealer_account, exclude=['logo'])
                    if order.owner.dealer_account.logo:
                        dealer_account_dict['logo_url'] = order.owner.dealer_account.logo.url
                    order_dict['owner']['dealer_account'] = dealer_account_dict
            if order.quote:
                products = order.quote.get_products()
                quote_dict = model_to_dict(order.quote)
                quote_dict['created_at'] = order.quote.created_at.strftime("%Y-%m-%d %H:%M:%S")
                quote_dict['updated_at'] = order.quote.updated_at.strftime("%Y-%m-%d %H:%M:%S")
                if products:
                    quote_dict['products'] = []
                    for product in products:
                        product_dict = model_to_dict(product)
                        product_dict['total_price'] = product.total_price
                        product_dict['product_line_price_with_markup'] = product.product_line_price_with_markup
                        product_dict['total_price_with_markup'] = product.total_price_with_markup
                        product_dict['product'] = model_to_dict(product.product, exclude=['image'])
                        if product.product.image:
                            product_dict['product']['image_url'] = product.product.image.url
                        quote_dict['products'].append(product_dict)
                if order.quote.owner:
                    owner_dict = model_to_dict(order.quote.owner, exclude=['password', 'profile_pic'])
                    if order.quote.owner.profile_pic:
                        owner_dict['profile_pic_url'] = order.quote.owner.profile_pic.url  
                    quote_dict['owner'] = owner_dict
                    if order.quote.owner.dealer_account:
                        dealer_account_dict = model_to_dict(order.quote.owner.dealer_account, exclude=['logo'])
                        if order.quote.owner.dealer_account.logo:
                            dealer_account_dict['logo_url'] = order.quote.owner.dealer_account.logo.url
                        quote_dict['owner']['dealer_account'] = dealer_account_dict
                order_dict['quote'] = quote_dict
            serialized_orders.append(order_dict)
        return serialized_orders
    

    def allowed_to_manage(self, target_user):
        if self.role == "AppAdmin" or self.role == "AppManager":
            return True
        elif (
            self.is_dealer_admin() and target_user.dealer_account == self.dealer_account
        ):
            return True
        elif self.role == "Estimator" and target_user == self:
            return True
        elif self.role == "DealerAdmin" and target_user == self:
            return True
        else:
            return False

    def allowed_to_manage_status(self, target_user):
        if target_user == self:
            return False
        elif self.role == "AppAdmin" or self.role == "AppManager":
            return True
        elif (
            self.is_dealer_admin() and target_user.dealer_account == self.dealer_account
        ):
            return True
        else:
            return False

    def get_users_to_notify(self):
        """
        Returns a list of users to notify when this user creates an estimate
        """
        # Always notify AppAdmin and AppManager users
        users_to_notify = list(User.objects.filter(role__in=["AppAdmin", "AppManager"]))

        # Notify the user who is performing the action
        users_to_notify.append(self)

        # If the user has a DealerAccount, notify the DealerAdmin of that account
        if self.dealer_account:
            dealer_admin = self.dealer_account.dealer_admin
            if dealer_admin:
                users_to_notify.append(dealer_admin)

        return users_to_notify

    def save(self, *args, **kwargs):
        if self.address:
            address_lines = [line.strip() for line in self.address.splitlines()]
            self.address = ", ".join(address_lines)

        super().save(*args, **kwargs)


class DealerAccount(models.Model):
    id = models.AutoField(primary_key=True)
    zoho_id = models.CharField(
        max_length=255, null=True, blank=True
    )  # The Zoho id field
    zoho_email = models.EmailField(null=True, blank=True)
    name = models.CharField(max_length=255)
    logo = models.ImageField(
        upload_to="dealer_logos/", blank=True, null=True, default="dealership.png"
    )
    pricing_tier = models.CharField(max_length=255, blank=True, null=True)
    company_address = models.TextField()
    company_phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    @property
    def dealer_admin(self):
        return self.users.filter(role="DealerAdmin").first()

    def get_estimators(self):
        return User.objects.filter(dealer_account=self, role="Estimator")

    def allowed_to_manage(self, user):
        return (
            user.role == "AppAdmin"
            or user.role == "AppManager"
            or (user.role == "DealerAdmin" and user.dealer_account == self)
        )


# ERROR WHEN CREATING A NEW ACCOUNT
# def save(self, *args, **kwargs):
# Check that there's only one dealer admin for this dealer account
# dealer_admin_count = self.users.filter(role="DealerAdmin").count()
# if dealer_admin_count > 1:
#  raise ValidationError("A dealer account can have only one dealer admin.")
# super().save(*args, **kwargs)


class ItemGroup(models.Model):
    group_id = models.CharField(max_length=255, unique=True)
    group_name = models.CharField(max_length=255)

    def __str__(self):
        return self.group_name


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    zoho_group = models.ForeignKey(
        ItemGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    zoho_item_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="images/", blank=True, null=True)
    image_name = models.CharField(max_length=255, null=True, blank=True, default=None)
    price = models.DecimalField(
        max_digits=8, decimal_places=2, blank=True, null=True, default=0.00
    )
    stock = models.FloatField(default=0, blank=True, null=True)
    last_modified = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

    def sku_to_image_filename(self):
        sku_parts = self.sku.split(" ")
        filename = ""

        # Add the system part (MG600, MG3000, MG350, etc.)
        filename += sku_parts[0].lower()

        # If the system is MG350, add the type of window (SH, PW)
        if sku_parts[0].lower() == "mg350" and sku_parts[1].lower() in ["sh", "pw"]:
            filename += "-" + sku_parts[1].lower()

        # If the system is MG3000 or ECO600 and it is a door, add the door type (XL, XR, XXL, XXR)
        elif sku_parts[0].lower() in ["mg3000", "eco600"] and any(
            x in self.sku.lower() for x in ["xl", "xr", "xxl", "xxr"]
        ):
            door_types = ["xl", "xr", "xxl", "xxr"]
            for door_type in door_types:
                if door_type in self.sku.lower():
                    filename += "-" + door_type

        # If the system is MG300 or MG350 and the width is 106 or 110, add '-3panels'
        if sku_parts[0].lower() in ["mg300", "mg350"] and any(
            x in self.sku for x in ["106", "110"]
        ):
            filename += "-3panels"

        filename += ".png"

        return filename        

    def save(self, *args, **kwargs):
        if not self.image_name:
            self.image_name = self.sku_to_image_filename()
            # Check if the file actually exists in your file system
            # if not os.path.isfile(
            #     os.path.join(settings.STATIC_ROOT, "styles/img/products/", self.image_name)
            # ):
            #     # If the image does not exist, set the image_name to default
            #     self.image_name = "default.png"
        super().save(*args, **kwargs)  # Call the "real" save() method


class Quote(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey("User", on_delete=models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    markup = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True)

    total_sell = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, default=0
    )
    total_cost = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, default=0
    )
    markup_total = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, default=0
    )

    status = models.CharField(
        max_length=255,
        choices=(
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("ordered", "Ordered"),
        ),
        default="active",
    )

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.name} - {self.owner}"

    def is_product_in_stock(self):
        in_stock = {}
        for quote_product in self.quoteproduct_set.all():
            product_name = quote_product.product.name
            product_stock = quote_product.product.stock
            required_quantity = quote_product.quantity

            if product_stock > 0:
                if required_quantity > product_stock:
                    in_stock[product_name] = "Insufficient stock for quote"
                else:
                    in_stock[product_name] = "In stock"
            else:
                in_stock[product_name] = "Out of stock"
        return in_stock

    def calculate_price(self):
        total_cost = 0
        for quote_product in self.quoteproduct_set.all():
            total_cost += quote_product.total_price

        markup_total = total_cost * (Decimal(self.markup) / 100)
        total_sell = total_cost + markup_total

        # Only save if the price has changed
        if self.total_sell != total_sell:
            self.total_cost = total_cost
            self.markup_total = markup_total
            self.total_sell = total_sell

            self.save()

        return self.total_sell

    def get_products(self):
        """
        Return the queryset of QuoteProduct objects associated with this quote
        """
        return self.quoteproduct_set.all().order_by("id")

    # Check if the current user is the quote owner, quote owner's dealer admin, or an AppAdmin
    def is_editable_by(self, user):
        return (
            user == self.owner
            or (
                self.owner.dealer_account is not None
                and user == self.owner.dealer_account.dealer_admin
            )
            or user.role == "AppAdmin"
            or user.role == "AppManager"
        )

    def replace_product(self, quote_product_id, replacement_sku):
        # Get the QuoteProduct by id
        quote_product = self.quoteproduct_set.filter(id=quote_product_id).first()

        if quote_product is not None:
            # Get the replacement product from the database
            replacement_product = Product.objects.filter(sku=replacement_sku).first()

            if replacement_product is not None:
                # Update the product and save
                quote_product.product = replacement_product
                quote_product.save()

                return True

        return False

    def is_empty(self):
        return self.quoteproduct_set.count() == 0


class QuoteProduct(models.Model):
    id = models.AutoField(primary_key=True)
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quote} - {self.product}"

    @property
    def total_price(self):
        """
        Calculate the total price of the quote product
        """
        return self.product.price * self.quantity

    @property
    def product_line_price_with_markup(self):
        """
        Return the product line price including the markup
        """
        return round(
            self.product.price
            + self.product.price * (Decimal(self.quote.markup / 100)),
            2,
        )

    @property
    def total_price_with_markup(self):
        """
        Return the total price of the quote product including the markup
        """
        return round(
            self.total_price + self.total_price * (Decimal(self.quote.markup / 100)), 2
        )


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    order_number = models.CharField(max_length=6, unique=True, null=True)  # allow null
    custom_order_id_suffix = models.IntegerField(default=0)
    owner = models.ForeignKey("User", on_delete=models.CASCADE)
    quote = models.OneToOneField(Quote, on_delete=models.CASCADE, related_name="order")
    total_cost = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=255,
        choices=(
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("paid", "Paid"),
            ("ready_to_pickup", "Ready to PickUp"),
            ("canceled", "Canceled"),
            ("completed", "Completed"),
        ),
        default="pending",
    )

    def save(self, *args, **kwargs):
        if not self.order_number:
            max_id = Order.objects.all().aggregate(Max("custom_order_id_suffix"))[
                "custom_order_id_suffix__max"
            ]
            if max_id:
                self.custom_order_id_suffix = max_id + 1
            else:
                self.custom_order_id_suffix = 1
            self.order_number = "00{:04}".format(
                self.custom_order_id_suffix
            )  # prefix hardcoded as '00'
        super(Order, self).save(*args, **kwargs)

        def __str__(self):
            return f"{self.id} - {self.status}"
