from django.conf import settings
from django.http import HttpResponsePermanentRedirect

class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Evitar redirecciones si la ruta es '/health/'
        if request.path == '/health/':
            return self.get_response(request)

        # Aplica la redirección si es necesario
        if settings.SECURE_SSL_REDIRECT and not request.is_secure():
            return HttpResponsePermanentRedirect('https://' + request.get_host() + request.get_full_path())

        return self.get_response(request)