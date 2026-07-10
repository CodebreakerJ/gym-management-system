from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.models import MembershipPlan
from core.serializers import MembershipPlanSerializer
from core.utils.helpers import get_user_gym


class MembershipPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return MembershipPlan.objects.filter(gym=gym)

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)