from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .models import User
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                # token = default_token_generator.make_token(user)
                # uid = urlsafe_base64_encode(force_bytes(user.pk))
                # domain = get_current_site(request).domain
                # reset_link = f"http://{domain}/reset-password/?uid={uid}&token={token}"
                # send_mail(
                #     'Password Reset Request',
                #     f'Click the following link to reset your password: {reset_link}',
                #     settings.DEFAULT_FROM_EMAIL,
                #     [email],
                # )
                subject = "Password Reset Requested"
                email_template_name = "base/password_reset/password_reset_email.html"
                c = {
                        "email": user.email,
                        "domain": request.META['HTTP_HOST'],
                        "site_name": "New Window System Dealerportal",
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "user": user,
                        "token": default_token_generator.make_token(user),
                        "protocol": "https" if request.is_secure() else "http",
                }
                email_body = render_to_string(email_template_name, c)
                    
                send_mail(
                        subject=subject, 
                        message=None, 
                        from_email=settings.DEFAULT_FROM_EMAIL, 
                        recipient_list=[user.email], 
                        fail_silently=False, 
                        html_message=email_body
                )
            return Response({"message": "If an account with that email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
def password_reset_confirm(request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                uid = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid)
                if default_token_generator.check_token(user, token):
                    user.set_password(new_password)
                    user.save()
                    return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
