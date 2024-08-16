from functools import wraps
from django.shortcuts import redirect

# custom decorator to check if user Role matches the passed Role


def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)
            else:
                return redirect(request.META.get('HTTP_REFERER', '/'))
        return wrapper
    return decorator
