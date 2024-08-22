from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy

class CustomPasswordResetView(auth_views.PasswordResetView):
    template_name = 'base/password_reset/password_reset_form.html'
    email_template_name = 'base/password_reset/password_reset_email.html'
    success_url = reverse_lazy('password_reset_done')