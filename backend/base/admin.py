from django.contrib import admin
from .models import QuoteProduct, Product, Quote, Order, User, DealerAccount, ItemGroup
from zoho_api.models import AppConfig
from utils.models import Invitation
from notifications.models import Notification

admin.site.register(Product)
admin.site.register(Quote)
admin.site.register(Order)
admin.site.register(User)
admin.site.register(QuoteProduct)
admin.site.register(AppConfig)
admin.site.register(DealerAccount)
admin.site.register(ItemGroup)
admin.site.register(Invitation)
admin.site.register(Notification)
