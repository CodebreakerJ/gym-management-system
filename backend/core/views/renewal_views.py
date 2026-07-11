from datetime import date

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Member, MembershipHistory, MembershipPlan
from core.serializers import (
    MembershipHistorySerializer,
    MembershipRenewalSerializer,
)
from core.utils.helpers import get_user_gym


def add_months(original_date, months):
    """
    Add months to a date safely.

    Example:
    31 January + 1 month becomes the last valid day of February.
    """
    month_index = original_date.month - 1 + months
    year = original_date.year + month_index // 12
    month = month_index % 12 + 1

    days_in_month = [
        31,
        29 if (
            year % 400 == 0 or
            (year % 4 == 0 and year % 100 != 0)
        ) else 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ]

    day = min(original_date.day, days_in_month[month - 1])

    return date(year, month, day)


class RenewMembershipView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, member_id):
        gym = get_user_gym(request.user)

        serializer = MembershipRenewalSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        try:
            member = (
                Member.objects
                .select_for_update()
                .get(
                    id=member_id,
                    gym=gym,
                )
            )
        except Member.DoesNotExist:
            return Response(
                {
                    "detail": "Member not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        plan_id = serializer.validated_data["plan_id"]

        try:
            plan = MembershipPlan.objects.get(
                id=plan_id,
                gym=gym,
            )
        except MembershipPlan.DoesNotExist:
            return Response(
                {
                    "plan_id": (
                        "Membership plan not found for this gym."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_start_date = serializer.validated_data.get(
            "start_date"
        )

        today = timezone.localdate()

        if requested_start_date:
            renewal_start_date = requested_start_date
        elif member.expiry_date and member.expiry_date >= today:
            renewal_start_date = member.expiry_date
        else:
            renewal_start_date = today

        renewal_end_date = add_months(
            renewal_start_date,
            plan.duration_months,
        )

        history = MembershipHistory.objects.create(
            gym=gym,
            member=member,
            plan=plan,
            start_date=renewal_start_date,
            end_date=renewal_end_date,
            plan_price=plan.price,
            notes=serializer.validated_data.get(
                "notes",
                "",
            ),
            created_by=request.user,
        )

        member.plan = plan
        member.joining_date = renewal_start_date
        member.expiry_date = renewal_end_date
        member.is_active = renewal_end_date >= today

        member.save(
            update_fields=[
                "plan",
                "joining_date",
                "expiry_date",
                "is_active",
            ]
        )

        return Response(
            {
                "message": "Membership renewed successfully.",
                "renewal": MembershipHistorySerializer(
                    history
                ).data,
                "member": {
                    "id": member.id,
                    "name": member.name,
                    "plan": plan.plan_name,
                    "joining_date": member.joining_date,
                    "expiry_date": member.expiry_date,
                    "is_active": member.is_active,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class MemberMembershipHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, member_id):
        gym = get_user_gym(request.user)

        try:
            member = Member.objects.get(
                id=member_id,
                gym=gym,
            )
        except Member.DoesNotExist:
            return Response(
                {
                    "detail": "Member not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        history = (
            MembershipHistory.objects
            .filter(
                gym=gym,
                member=member,
            )
            .select_related(
                "member",
                "plan",
                "created_by",
            )
        )

        serializer = MembershipHistorySerializer(
            history,
            many=True,
        )

        return Response(
            {
                "member": {
                    "id": member.id,
                    "name": member.name,
                    "phone": member.phone,
                    "current_plan": (
                        member.plan.plan_name
                        if member.plan
                        else None
                    ),
                    "current_expiry_date": member.expiry_date,
                },
                "count": history.count(),
                "history": serializer.data,
            }
        )


class AllMembershipHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        history = (
            MembershipHistory.objects
            .filter(gym=gym)
            .select_related(
                "member",
                "plan",
                "created_by",
            )
        )

        serializer = MembershipHistorySerializer(
            history,
            many=True,
        )

        return Response(
            {
                "count": history.count(),
                "results": serializer.data,
            }
        )