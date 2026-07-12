from datetime import timedelta

from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Attendance, Member
from core.pagination import StandardResultsSetPagination
from core.permissions import IsOwnerOrReceptionist
from core.serializers import MemberSerializer
from core.utils.helpers import get_user_gym


class NotificationSummaryView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()
        next_7_days = today + timedelta(days=7)

        members = Member.objects.filter(gym=gym)

        attended_member_ids = (
            Attendance.objects
            .filter(
                gym=gym,
                date=today,
            )
            .values_list(
                "member_id",
                flat=True,
            )
        )

        expiring_today = members.filter(
            expiry_date=today
        ).count()

        expiring_next_7_days = members.filter(
            expiry_date__gt=today,
            expiry_date__lte=next_7_days,
        ).count()

        expired_members = members.filter(
            expiry_date__lt=today,
        ).count()

        absent_today = members.filter(
            expiry_date__gte=today,
        ).exclude(
            id__in=attended_member_ids,
        ).count()

        total_notifications = (
            expiring_today
            + expiring_next_7_days
            + expired_members
        )

        return Response({
            "total_notifications": total_notifications,
            "expiring_today": expiring_today,
            "expiring_next_7_days": (
                expiring_next_7_days
            ),
            "expired_members": expired_members,
            "absent_today": absent_today,
        })


class ExpiringMembersNotificationView(ListAPIView):
    serializer_class = MemberSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        today = timezone.localdate()

        try:
            days = int(
                self.request.query_params.get(
                    "days",
                    7,
                )
            )
        except ValueError:
            days = 7

        days = min(max(days, 1), 30)
        end_date = today + timedelta(days=days)

        return (
            Member.objects
            .filter(
                gym=gym,
                expiry_date__gte=today,
                expiry_date__lte=end_date,
            )
            .select_related("plan")
            .order_by("expiry_date")
        )


class AbsentMembersNotificationView(ListAPIView):
    serializer_class = MemberSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        today = timezone.localdate()

        attended_member_ids = (
            Attendance.objects
            .filter(
                gym=gym,
                date=today,
            )
            .values_list(
                "member_id",
                flat=True,
            )
        )

        return (
            Member.objects
            .filter(
                gym=gym,
                expiry_date__gte=today,
            )
            .exclude(
                id__in=attended_member_ids,
            )
            .select_related("plan")
            .order_by("name")
        )


class ExpiredMembersNotificationView(ListAPIView):
    serializer_class = MemberSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        today = timezone.localdate()

        return (
            Member.objects
            .filter(
                gym=gym,
                expiry_date__lt=today,
            )
            .select_related("plan")
            .order_by("-expiry_date")
        )