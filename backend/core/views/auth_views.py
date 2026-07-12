from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from core.models import Gym, StaffProfile


class GymTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        owner_gym = Gym.objects.filter(
            owner=user
        ).first()

        staff_profile = (
            StaffProfile.objects
            .select_related("gym")
            .filter(
                user=user,
                is_active=True,
                user__is_active=True,
            )
            .first()
        )

        if owner_gym:
            gym = owner_gym
            role = "owner"
        elif staff_profile:
            gym = staff_profile.gym
            role = staff_profile.role
        else:
            raise AuthenticationFailed(
                "No gym is associated with this account."
            )

        if not gym.is_access_active:
            raise AuthenticationFailed(
                "Your gym software access has expired. "
                "Please contact the software administrator "
                "to renew your yearly access."
            )

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": role,
        }

        data["gym"] = {
            "id": gym.id,
            "gym_name": gym.gym_name,
            "access_start_date": gym.access_start_date,
            "access_expiry_date": gym.access_expiry_date,
            "access_status": gym.access_status,
        }

        return data


class GymTokenObtainPairView(TokenObtainPairView):
    serializer_class = GymTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "refresh": (
                        "Refresh token is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

        except TokenError:
            return Response(
                {
                    "detail": (
                        "Refresh token is invalid "
                        "or expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Logged out successfully."
            },
            status=status.HTTP_200_OK,
        )