from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.serializers import Serializer, CharField
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from apps.settings.models import DairySettings
from .models import AuditLog

class ChangePasswordSerializer(Serializer):
    old_password = CharField(required=True)
    new_password = CharField(required=True)

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate new password
            try:
                validate_password(serializer.validated_data.get("new_password"), user)
            except Exception as e:
                return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            
            AuditLog.objects.create(
                user=user,
                action='PASSWORD_CHANGE',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        try:
            dairy = DairySettings.objects.first()
            dairy_info = {
                "dairy_name": dairy.dairy_name if dairy else "",
                "owner_name": dairy.owner_name if dairy else "",
                "phone": dairy.phone if dairy else "",
                "address": dairy.address if dairy else "",
                "gst_number": dairy.gst_number if dairy else ""
            }
        except Exception:
            dairy_info = {}

        return Response({
            "account": {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": "System Administrator" if user.is_superuser else "Staff"
            },
            "dairy": dairy_info
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        data = request.data
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
            
        user.save()
        
        AuditLog.objects.create(
            user=user,
            action='PROFILE_UPDATE',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
