from pathlib import Path
import os
import django_heroku
import environ
from datetime import timedelta
import logging

logger = logging.getLogger('django')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent

LOGIN_URL = 'base-login'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

env = environ.Env(
    DEBUG=(bool, False)
)

environ.Env.read_env()

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['api.newwindowsystem.net', 'www.newwindowsystem.net', 'newwindowsystem.net', 'localhost'])

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CORS_ALLOW_METHODS = env.list('CORS_ALLOW_METHODS', default=[])
CORS_ALLOW_HEADERS = env.list('CORS_ALLOW_HEADERS', default=[])
CORS_TRUSTED_ORIGINS = env.list('CORS_TRUSTED_ORIGINS', default=[])

ENVIRONMENT = env('ENVIRONMENT')

FRONTEND_API_URL = env('FRONTEND_API_URL_DEV') if ENVIRONMENT == 'DEV' else env('FRONTEND_API_URL_QA') if ENVIRONMENT == 'QA' else env('FRONTEND_API_URL_PROD')

DB_NAME = env('DB_NAME_DEV') if ENVIRONMENT == 'DEV' else env('DB_NAME_QA') if ENVIRONMENT == 'QA' else env('DB_NAME_PROD')
DB_USER = env('DB_USER_DEV') if ENVIRONMENT == 'DEV' else env('DB_USER_QA') if ENVIRONMENT == 'QA' else env('DB_USER_PROD')
DB_PASSWORD = env('DB_PASSWORD_DEV') if ENVIRONMENT == 'DEV' else env('DB_PASSWORD_QA') if ENVIRONMENT == 'QA' else env('DB_PASSWORD_PROD')
DB_HOST = env('DB_HOST_DEV') if ENVIRONMENT == 'DEV' else env('DB_HOST_QA') if ENVIRONMENT == 'QA' else env('DB_HOST_PROD')
SECRET_KEY = env('SECRET_KEY_DEV') if ENVIRONMENT == 'DEV' else env('SECRET_KEY_QA') if ENVIRONMENT == 'QA' else env('SECRET_KEY_PROD')
DB_PORT = env('DB_PORT')
DB_ENGINE = env('DB_ENGINE')

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "base.apps.BaseConfig",
    "zoho_api.apps.ZohoApiConfig",
    "utils.apps.UtilsConfig",
    "notifications.apps.NotificationsConfig",
    "app_settings.apps.AppSettingsConfig",
    "django_celery_results",
    "django_celery_beat",
    "storages",
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

AUTH_USER_MODEL = "base.User"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

django_heroku.settings(locals())
ROOT_URLCONF = "dealerportal.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "notifications.context_processors.notification_processor",
            ],
            "libraries": {"my_filters": "dealerportal.my_filters"},
        },
    },
]

WSGI_APPLICATION = "dealerportal.wsgi.application"

DATABASES = {
    'default': {
        'ENGINE': f'{DB_ENGINE}',
        'NAME': f'{DB_NAME}',
        'USER': f'{DB_USER}',
        'PASSWORD': f'{DB_PASSWORD}',
        'HOST': f'{DB_HOST}',
        'PORT': f'{DB_PORT}',
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "US/Eastern"
USE_I18N = True
USE_TZ = True

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

ALLOWED_MODELS_TO_SEARCH = [
    "base.Products",
    "base.ItemGroup",
    "base.Quote",
    "base.Order",
]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": (
                "%(asctime)s [%(process)d] [%(levelname)s] "
                + "pathname=%(pathname)s lineno=%(lineno)s "
                + "funcname=%(funcName)s %(message)s"
            ),
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "simple": {"format": "%(levelname)s %(message)s"},
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"],
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

EMAIL_BACKEND = env("EMAIL_BACKEND")
EMAIL_HOST_USER = env("EMAIL_HOST_USER_DEV") if ENVIRONMENT == 'DEV' else env("EMAIL_HOST_USER_QA") if ENVIRONMENT == 'QA' else env("EMAIL_HOST_USER_PROD")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD_DEV") if ENVIRONMENT == 'DEV' else env("EMAIL_HOST_PASSWORD_QA") if ENVIRONMENT == 'QA' else env("EMAIL_HOST_PASSWORD_PROD")
EMAIL_HOST = env('EMAIL_HOST_DEV') if ENVIRONMENT == 'DEV' else env('EMAIL_HOST_QA') if ENVIRONMENT == 'QA' else env('EMAIL_HOST_PROD')
EMAIL_PORT = env('EMAIL_PORT_DEV') if ENVIRONMENT == 'DEV' else env('EMAIL_PORT_QA') if ENVIRONMENT == 'QA' else env('EMAIL_PORT_PROD')
EMAIL_USE_TLS = env('EMAIL_USE_TLS_DEV') if ENVIRONMENT == 'DEV' else env('EMAIL_USE_TLS_QA') if ENVIRONMENT == 'QA' else env('EMAIL_USE_TLS_PROD')
EMAIL_USE_SSL = False
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL_DEV') if ENVIRONMENT == 'DEV' else env('DEFAULT_FROM_EMAIL_QA') if ENVIRONMENT == 'QA' else env('DEFAULT_FROM_EMAIL_PROD')

# Adding Celery config to schedule sync and tasks
broker_url = env("CELERY_BROKER_URL")
accept_content = env.list("CELERY_ACCEPT_CONTENT", default=["json"])
result_serializer = env("CELERY_RESULT_SERIALIZER")
task_serializer = env("CELERY_TASK_SERIALIZER")
timezone = env("CELERY_TIMEZONE")
result_backend = env("CELERY_RESULT_BACKEND_DEV") if ENVIRONMENT == 'DEV' else env("CELERY_RESULT_BACKEND_QA") if ENVIRONMENT == 'QA' else env("CELERY_RESULT_BACKEND_PROD")
redis_max_conections = 100

CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

CELERY_BROKER_TRANSPORT_OPTIONS = {
       'visibility_timeout': 3600,  
       'retry_policy': {
           'max_retries': 5,
           'interval_start': 0,  
           'interval_step': 0.2,
           'interval_max': 0.5, 
       }
   }

redis_backend_use_ssl = {
    'ssl_cert_reqs': None
}

broker_use_ssl = {
    'ssl_cert_reqs': None
}

CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# AWS S3 config
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME")
AWS_S3_CUSTOM_DOMAIN = env("AWS_S3_CUSTOM_DOMAIN")

DEFAULT_FILE_STORAGE = env("DEFAULT_FILE_STORAGE")
STATICFILES_STORAGE = env("STATICFILES_STORAGE")

# Static files config
STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Security settings
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_USE_SESSIONS = True
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
# SECURE_SSL_REDIRECT = True
X_FRAME_OPTIONS = 'DENY'
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_REDIRECT_EXEMPT = [r'^health/$']