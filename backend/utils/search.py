from django.db.models import Q
from base.models import ItemGroup, Product, Quote, QuoteProduct

def search(query, models):
    query = query.lower()

    results = {}
    for model in models:
        search_fields = []
        for field in model._meta.get_fields():
            if field.get_internal_type() in ['CharField', 'TextField']:
                search_fields.append(field.name)

        query_conditions = [Q(**{f"{field}__icontains": query}) for field in search_fields]
        q_object = Q()
        for condition in query_conditions:
            q_object |= condition

        results[model.__name__] = model.objects.filter(q_object)

    return results