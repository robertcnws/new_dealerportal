from django.urls import path
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views, auth
from .views_password_reset import password_reset_request, password_reset_confirm

urlpatterns = [
    # API URLS TO REACT FRONTEND
    path("api-dealerportal-login/", views.apiDealerportalLoginPage, name="api-dealerportal-base-login"),
    path("api-dealerportal-home/", views.apiDealerportalHome, name="api-dealerportal-base-home"),
    path("api-dealerportal-quotes/", views.apiDealerportalListQuotes, name="api-dealerportal-base-quotes"),
    path("api-dealerportal-check-stock/", views.api_dealerportal_check_stock, name="api-dealerportal-check-stock"),
    path("api-dealerportal-get-products/", views.api_dealerportal_get_products, name="api-dealerportal-get-products"),
    path("api-dealerportal-quote-products/<int:pk>/", views.api_dealerportal_view_quote_products, name="api-dealerportal-quote-products"),
    path("api-dealerportal-manage-product-to-quote/", views.api_dealerportal_manage_product_to_quote, name="api-dealerportal-manage-product-to-quote"),
    path("api-dealerportal/quotes/delete/<int:pk>/", views.api_dealerportal_delete_quote, name="api-dealerportal-delete-quote"),
    path("api-dealerportal/orders/create/<int:pk>/", views.api_dealerportal_create_order, name="api-dealerportal-create-order"),
    path("api-dealerportal/quotes/create/", views.api_dealerportal_create_quote, name="api-dealerportal-create-quote"),
    path("api-dealerportal/quotes/clone/<int:pk>/", views.api_dealerportal_clone_quote, name="api-dealerportal-clone-quote"),
    path("api-dealerportal-orders/", views.api_dealerportal_orders, name="api-dealerportal-orders"),
    path('api-dealerportal/password-reset/', password_reset_request, name='password_reset_request'),
    path('api-dealerportal/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    # BACKEND URLS
    path("login/", views.loginPage, name="base-login"),
    path("logout/", views.logoutUser, name="base-logout"),
    path("register", views.registerPage, name="base-register"),
    path('password_reset/', views.password_reset_request, name='password_reset'),
    path('password_reset/done/', views.CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', views.password_reset_confirm, name='password_reset_confirm'),
    path('reset/done/', views.CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('reset/invalid/', views.password_reset_invalid, name='password_reset_invalid'),
    path("", views.home, name="base-home"),
    path("check-stock", views.check_stock, name="base-check-stock"),
    # QUOTES URLS AND VIEWS
    path("quotes/", views.quotes, name="base-view-quotes"),
    path("quotes/view/<int:pk>/", views.view_quote, name="base-view-quote"),
    path("quotes/create/", views.create_quote, name="base-create-quote"),
    path(
        "quotes/create/smart/", views.create_smart_quote, name="base-create-smart-quote"
    ),
    path("quotes/update/<int:pk>/", views.update_quote, name="base-update-quote"),
    path(
        "quote/update-notes/<int:quote_id>/",
        views.update_quote_notes,
        name="update_quote_notes",
    ),
    path("quotes/delete/<int:pk>/", views.delete_quote, name="base-delete-quote"),
    path("quotes/clone/<int:pk>/", views.clone_quote, name="base-clone-quote"),
    # URLS AND VIEWS TO ADD AND MANAGE THE QUOTES ITEMS
    path(
        "quote/delete-item/<int:pk>",
        views.delete_quote_product,
        name="base-delete-quoteproduct",
    ),
    path(
        "replace_item_in_quote/",
        views.replace_item_in_quote,
        name="base-replace_item_in_quote",
    ),
    path(
        "quote/edit-item/<int:pk>/",
        views.edit_quote_product,
        name="base-edit-quoteproduct",
    ),
    path(
        "quote/save_products/",
        views.save_products_to_quote,
        name="base-save_products_to_quote",
    ),
    # ORDERS URLS AND VIEWS
    path("orders/", views.orders, name="base-view-orders"),
    path("orders/view/<int:pk>/", views.view_order, name="base-view-order"),
    path("orders/create/<int:pk>/", views.create_order, name="base-create-order"),
    path("update_order_status/", views.order_status_update, name="order_status_update"),
    path("orders/delete/<int:pk>/", views.delete_order, name="base-delete-order"),
    # URLS AND VIEWS TO ADD AND MANAGE THE USERS ESTIMATORS AND DEALERS
    path("dealerships/", views.manageDealers, name="base-manage-dealers"),
    path("dealerships/create/", views.createDealership, name="base-create-dealership"),
    path(
        "manage-dealership/<int:pk>/",
        views.manageDealership,
        name="base-manage-dealership",
    ),
    path(
        "manage-dealership/<int:pk>/details/",
        views.updateDealershipDetails,
        name="base-update-dealership-details",
    ),
    path(
        "manage-dealership/status/<int:pk>/",
        views.manageDealershipStatus,
        name="base-change_status-dealership",
    ),
    path(
        "manage-dealership/users/create/<int:pk>/",
        views.createEstimator,
        name="base-create-estimator",
    ),
    path(
        "manage-dealership/users/manage-status/<int:pk>/",
        views.manageDealershipUserStatus,
        name="base-change_status-user",
    ),
    path(
        "manage-dealership/users/manage-admin/<int:pk>/",
        views.manageDealerAdminUser,
        name="base-change_dealer_admin",
    ),
    # Update the selected user profile info
    path("manage-account/<int:pk>/", views.manageUser, name="base-manage-user"),
    # path('dealer/create', views.create_dealer, name='base-create-dealer'),
    # path('dealer/update/<int:pk>/', views.update_dealer, name='base-update-dealer'),
    # path('dealer/delete/<int:pk>/', views.delete_dealer, name='base-delete-dealer'),
    # USER PROFILE VIEWS AND SECURITY
    # path('profile/update-password/', views.updatePassword, name='base-password-update'),
    path("myprofile/view/", views.myProfile, name="base-myprofile"),
    path("myprofile/edit/", views.updateProfile, name="base-update-profile"),
    path("toggle_light_mode/", views.toggle_light_mode, name="toggle_light_mode"),
    path("update_profile_pic/", views.update_profile_pic, name="update-profile-pic"),
    # AJAX URLS
    path("orders/async/", views.orders_ajax, name="base-orders_ajax"),
    path("quotes/async/", views.quotes_ajax, name="base-quotes-ajax"),
    # JWT TOKEN URLS
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]
