from django.urls import path
from . import views

app_name = "utils"

urlpatterns = [
    path(
        "quote/pdf-view/<int:pk>",
        views.quote_render_pdf_view,
        name="utils-quote-view-pdf",
    ),
    path(
        "quote/pdf-view-cost/<int:pk>",
        views.quote_render_cost_pdf_view,
        name="utils-quote-view-cost-pdf",
    ),
    path(
        "quote/pdf-download/<int:pk>",
        views.quote_download_pdf_view,
        name="utils-quote-download-pdf",
    ),
    path("search/", views.search_view, name="utils-search_view"),
    # Email Invitation
    path("send-invitation/", views.send_invitation, name="utils-send-invitation"),
    path(
        "accept-invitation/<str:code>/",
        views.accept_invitation,
        name="utils-accept-invitation",
    ),
    path("delete-invitation/", views.delete_invitation, name="utils-delete-invitation"),
    path(
        "equalize-quote/<int:quote_id>/",
        views.equalize_quote_view,
        name="utils-equalize_quote",
    ),
    path(
        "resend-invitation/<int:invitation_id>/",
        views.resend_invitation,
        name="utils-resend_invitation",
    ),
    path(
        "analyze-quote-replacements/<int:quote_id>/",
        views.analyze_quote_and_suggest_replacements_view,
        name="utils-analyze_quote_and_suggest_replacements",
    ),
]
