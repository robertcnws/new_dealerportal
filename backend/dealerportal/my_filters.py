from django import template

register = template.Library()


@register.filter
def has_role(user, roles):
    roles_list = roles.split(',')
    return user.is_authenticated and user.role in roles_list
