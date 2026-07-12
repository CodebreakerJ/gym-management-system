from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import (
    FormParser,
    JSONParser,
    MultiPartParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Member
from core.pagination import StandardResultsSetPagination
from core.permissions import (
    IsGymOwner,
    IsOwnerOrReceptionist,
)
from core.serializers import MemberSerializer
from core.utils.helpers import get_user_gym


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    pagination_class = StandardResultsSetPagination

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    filter_backends = [
        SearchFilter,
        OrderingFilter,
        DjangoFilterBackend,
    ]

    search_fields = [
        "name",
        "phone",
        "email",
        "address",
        "plan__plan_name",
    ]

    ordering_fields = [
        "id",
        "name",
        "joining_date",
        "expiry_date",
        "age",
        "created_at",
    ]

    filterset_fields = [
        "gender",
        "is_active",
        "plan",
    ]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)

        queryset = (
            Member.objects
            .filter(gym=gym)
            .select_related("plan", "gym")
            .order_by("-id")
        )

        member_id = self.request.query_params.get(
            "member_id"
        )

        if member_id:
            queryset = queryset.filter(id=member_id)

        return queryset

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)

    def destroy(self, request, *args, **kwargs):
        member = self.get_object()
        member.soft_delete(request.user)

        return Response(
            {
                "message": "Member deleted successfully."
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="restore",
        permission_classes=[
            IsAuthenticated,
            IsGymOwner,
        ],
    )
    def restore_member(self, request, pk=None):
        gym = get_user_gym(request.user)

        member = get_object_or_404(
            Member.all_objects,
            id=pk,
            gym=gym,
            is_deleted=True,
        )

        member.restore()

        serializer = self.get_serializer(member)

        return Response({
            "message": "Member restored successfully.",
            "member": serializer.data,
        })

    @action(
        detail=False,
        methods=["get"],
        url_path="deleted",
        permission_classes=[
            IsAuthenticated,
            IsGymOwner,
        ],
    )
    def deleted_members(self, request):
        gym = get_user_gym(request.user)

        members = (
            Member.all_objects
            .filter(
                gym=gym,
                is_deleted=True,
            )
            .select_related(
                "plan",
                "deleted_by",
            )
            .order_by("-deleted_at")
        )

        page = self.paginate_queryset(members)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )

            return self.get_paginated_response(
                serializer.data
            )

        serializer = self.get_serializer(
            members,
            many=True,
        )

        return Response(serializer.data)