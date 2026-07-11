from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from core.models import GymSettings
from core.permissions import IsGymOwner
from core.serializers import (
    GymProfileSerializer,
    GymSettingsSerializer,
)
from core.utils.helpers import get_user_gym


class GymProfileView(RetrieveUpdateAPIView):
    serializer_class = GymProfileSerializer
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get_object(self):
        return get_user_gym(self.request.user)


class GymSettingsView(RetrieveUpdateAPIView):
    serializer_class = GymSettingsSerializer
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get_object(self):
        gym = get_user_gym(self.request.user)

        settings_object, _ = GymSettings.objects.get_or_create(
            gym=gym
        )

        return settings_object