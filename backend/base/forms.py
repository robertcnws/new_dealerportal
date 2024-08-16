from django.forms import ModelForm
from django import forms
from django.core.exceptions import ValidationError
import json
from django.contrib.auth.forms import UserCreationForm
from .models import Quote, User, DealerAccount
from django.contrib.auth.forms import AuthenticationForm


class QuoteForm(ModelForm):
    class Meta:
        model = Quote
        fields = ["name", "markup"]


class QuoteNotesForm(forms.ModelForm):
    class Meta:
        model = Quote
        fields = ["notes"]


class QuoteProductForm(forms.Form):
    quote = forms.IntegerField()  # Assuming the quote ID is an integer
    product_list = forms.CharField()  # JSON string of products data

    def clean_product_list(self):
        product_list = self.cleaned_data.get("product_list")
        try:
            product_list = json.loads(product_list)
            if isinstance(product_list, list):
                return product_list
            else:
                raise ValidationError("Invalid format for product list.")
        except json.JSONDecodeError:
            raise ValidationError("Invalid format for product list.")


class UserForm(ModelForm):
    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "address",
        ]


class MyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email"]


class MyUserInvitedForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "password1", "password2"]


class DealerAccountForm(forms.ModelForm):
    class Meta:
        model = DealerAccount
        fields = ["name", "logo", "company_address", "company_phone", "zoho_email"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Enter name"}),
            "logo": forms.ClearableFileInput(attrs={"placeholder": "Upload logo"}),
            "company_address": forms.TextInput(
                attrs={"placeholder": "Enter company address"}
            ),
            "company_phone": forms.NumberInput(
                attrs={"placeholder": "Enter company phone"}
            ),
            "zoho_email": forms.EmailInput(attrs={"placeholder": "Enter Zoho email"}),
        }


class CustomAuthenticationForm(AuthenticationForm):
    class Meta:
        model = User
        fields = ["username", "password"]
