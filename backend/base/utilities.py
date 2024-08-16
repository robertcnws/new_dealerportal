from django.db.models import Sum, Case, When, IntegerField, Q
from django.utils import timezone

from .models import Order, Quote


def get_today():
    return timezone.now().date()


def get_yesterday():
    return get_today() - timezone.timedelta(days=1)


def calculate_user_stats(user):
    today = get_today()
    yesterday = get_yesterday()

    quotes = user.get_quotes_for_user().annotate(
        total_today=Sum(
            Case(
                When(created_at__date=today, then="total_cost"),
                output_field=IntegerField(),
                default=0,
            )
        ),
    )
    total_quotes = quotes.aggregate(Sum("total_cost"))["total_cost__sum"] or 0
    today_quotes = quotes.aggregate(Sum("total_today"))["total_today__sum"] or 0

    orders = user.get_orders_for_user().annotate(
        total_today=Sum(
            Case(
                When(created_at__date=today, then="total_cost"),
                output_field=IntegerField(),
                default=0,
            )
        ),
    )
    total_orders = orders.aggregate(Sum("total_cost"))["total_cost__sum"] or 0
    today_orders = orders.aggregate(Sum("total_today"))["total_today__sum"] or 0

    lost_sales = total_quotes - total_orders

    # Counting today's and yesterday's quotes and orders
    today_quotes_count = quotes.filter(created_at__date=today).count()
    today_orders_count = orders.filter(created_at__date=today).count()
    yesterday_quotes_count = quotes.filter(created_at__date=yesterday).count()
    yesterday_orders_count = orders.filter(created_at__date=yesterday).count() 

    return {
        "total_estimates": total_quotes,
        "total_orders": total_orders,
        "lost_sales": lost_sales,
        "today_estimates": today_quotes,
        "today_orders": today_orders,
        "today_quotes_count": today_quotes_count,
        "today_orders_count": today_orders_count,
        "yesterday_quotes_count": yesterday_quotes_count,
        "yesterday_orders_count": yesterday_orders_count,
    }
