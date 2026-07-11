from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from core.models import Member
from core.serializers import MemberSerializer
from core.pagination import StandardResultsSetPagination
from core.utils.helpers import get_user_gym
from core.permissions import IsOwnerOrReceptionist


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReceptionist]
    pagination_class = StandardResultsSetPagination

    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ["name", "phone", "email"]
    ordering_fields = ["id", "name", "joining_date", "expiry_date", "age"]
    filterset_fields = ["gender", "is_active", "plan"]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return Member.objects.filter(gym=gym).order_by("-id")

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)