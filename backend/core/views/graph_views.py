from datetime import timedelta

from django.db.models import (
    Case,
    CharField,
    Count,
    When,
)
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Attendance, Member
from core.utils.helpers import get_user_gym


class GenderDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        data = (
            Member.objects
            .filter(gym=gym)
            .values("gender")
            .annotate(members=Count("id"))
            .order_by("gender")
        )

        return Response([
            {
                "gender": item["gender"],
                "members": item["members"],
            }
            for item in data
        ])


class AgeDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        members = Member.objects.filter(
            gym=gym,
            age__isnull=False,
        )

        return Response([
            {
                "age_group": "14-20",
                "members": members.filter(
                    age__gte=14,
                    age__lte=20,
                ).count(),
            },
            {
                "age_group": "21-30",
                "members": members.filter(
                    age__gte=21,
                    age__lte=30,
                ).count(),
            },
            {
                "age_group": "31-40",
                "members": members.filter(
                    age__gte=31,
                    age__lte=40,
                ).count(),
            },
            {
                "age_group": "41-50",
                "members": members.filter(
                    age__gte=41,
                    age__lte=50,
                ).count(),
            },
            {
                "age_group": "51+",
                "members": members.filter(
                    age__gte=51,
                ).count(),
            },
        ])

class AttendanceTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        try:
            days = int(
                request.query_params.get("days", 7)
            )
        except ValueError:
            days = 7

        days = min(max(days, 1), 31)
        start_date = today - timedelta(days=days - 1)

        attendance_counts = {
            item["date"]: item["attendance"]
            for item in (
                Attendance.objects
                .filter(
                    gym=gym,
                    date__range=[
                        start_date,
                        today,
                    ],
                )
                .values("date")
                .annotate(attendance=Count("id"))
            )
        }

        result = []

        for offset in range(days):
            current_date = start_date + timedelta(
                days=offset
            )

            result.append({
                "date": current_date,
                "day": current_date.strftime("%a"),
                "attendance": attendance_counts.get(
                    current_date,
                    0,
                ),
            })

        return Response(result)


class ExpiryTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        data = (
            Member.objects
            .filter(
                gym=gym,
                expiry_date__gte=today,
            )
            .annotate(
                month=TruncMonth("expiry_date")
            )
            .values("month")
            .annotate(
                members=Count("id")
            )
            .order_by("month")[:6]
        )

        return Response([
            {
                "month": item["month"].strftime(
                    "%Y-%m"
                ),
                "month_name": item["month"].strftime(
                    "%b %Y"
                ),
                "members": item["members"],
            }
            for item in data
        ])