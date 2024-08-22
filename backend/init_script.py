import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_api.settings')
django.setup()

from django.core.management import call_command
from base.models import User

def create_superuser():
    username = os.getenv('DJANGO_SUPERUSER_USERNAME')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

    if not User.objects.filter(username=username).exists():
        print("Creating superuser...")
        call_command('createsuperuser', '--noinput', '--username', username)
        user = User.objects.get(username=username)
        user.set_password(password)
        user.email = email
        user.save()
        print("Superuser created!")

def create_loginuser():
    username = os.getenv('LOGINUSER_USERNAME')
    email = os.getenv('LOGINUSER_EMAIL')
    password = os.getenv('LOGINUSER_PASSWORD')

    if not User.objects.filter(username=username).exists():
        print("Creating LoginUser...")
        User.objects.create_user(username=username, email=email, password=password, is_staff=True)
        print("LoginUser created!")

if __name__ == "__main__":
    create_superuser()
    create_loginuser()
