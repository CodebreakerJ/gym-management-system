from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import StaffProfile
from core.permissions import IsGymOwner
from core.serializers import (
    StaffCreateSerializer,
    StaffSerializer,
    StaffUpdateSerializer,
)
from core.utils.helpers import get_user_gym


class StaffListCreateView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)

        staff_members = (
            StaffProfile.objects
            .filter(gym=gym)
            .select_related("user", "gym")
            .order_by("-created_at")
        )

        serializer = StaffSerializer(
            staff_members,
            many=True,
        )

        return Response({
            "count": staff_members.count(),
            "results": serializer.data,
        })

    def post(self, request):
        gym = get_user_gym(request.user)

        serializer = StaffCreateSerializer(
            data=request.data,
            context={"gym": gym},
        )

        serializer.is_valid(raise_exception=True)
        staff_profile = serializer.save()

        return Response(
            {
                "message": "Staff account created successfully.",
                "staff": StaffSerializer(staff_profile).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffDetailView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get_staff(self, request, staff_id):
        gym = get_user_gym(request.user)

        return get_object_or_404(
            StaffProfile.objects.select_related("user", "gym"),
            id=staff_id,
            gym=gym,
        )

    def get(self, request, staff_id):
        staff_profile = self.get_staff(request, staff_id)

        return Response(
            StaffSerializer(staff_profile).data
        )

    def patch(self, request, staff_id):
        staff_profile = self.get_staff(request, staff_id)

        serializer = StaffUpdateSerializer(
            staff_profile,
            data=request.data,
            partial=True,
            context={
                "staff_profile": staff_profile,
            },
        )

        serializer.is_valid(raise_exception=True)
        updated_staff = serializer.save()

        return Response({
            "message": "Staff account updated successfully.",
            "staff": StaffSerializer(updated_staff).data,
        })

    def delete(self, request, staff_id):
        staff_profile = self.get_staff(request, staff_id)

        staff_profile.is_active = False
        staff_profile.save(update_fields=["is_active"])

        staff_profile.user.is_active = False
        staff_profile.user.save(update_fields=["is_active"])

        return Response({
            "message": "Staff account deactivated successfully."
        })