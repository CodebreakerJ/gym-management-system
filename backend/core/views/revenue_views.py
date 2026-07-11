from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import MembershipHistory
from core.permissions import IsGymOwner
from core.utils.helpers import get_user_gym


class RevenueSummaryView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        start_of_month = today.replace(day=1)
        start_of_year = today.replace(
            month=1,
            day=1,
        )

        history = MembershipHistory.objects.filter(
            gym=gym
        )

        total_revenue = (
            history.aggregate(
                total=Sum("plan_price")
            )["total"]
            or 0
        )

        monthly_revenue = (
            history.filter(
                created_at__date__gte=start_of_month,
                created_at__date__lte=today,
            ).aggregate(
                total=Sum("plan_price")
            )["total"]
            or 0
        )

        yearly_revenue = (
            history.filter(
                created_at__date__gte=start_of_year,
                created_at__date__lte=today,
            ).aggregate(
                total=Sum("plan_price")
            )["total"]
            or 0
        )

        renewals_this_month = history.filter(
            created_at__date__gte=start_of_month,
            created_at__date__lte=today,
        ).count()

        renewals_this_year = history.filter(
            created_at__date__gte=start_of_year,
            created_at__date__lte=today,
        ).count()

        return Response({
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "yearly_revenue": yearly_revenue,
            "renewals_this_month": renewals_this_month,
            "renewals_this_year": renewals_this_year,
        })


class MonthlyRevenueChartView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        start_of_year = today.replace(
            month=1,
            day=1,
        )

        revenue_data = (
            MembershipHistory.objects
            .filter(
                gym=gym,
                created_at__date__gte=start_of_year,
            )
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                revenue=Sum("plan_price"),
                renewals=Count("id"),
            )
            .order_by("month")
        )

        result = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "month_name": item["month"].strftime("%b"),
                "revenue": item["revenue"] or 0,
                "renewals": item["renewals"],
            }
            for item in revenue_data
        ]

        return Response(result)


class PlanWiseRevenueView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)

        revenue_data = (
            MembershipHistory.objects
            .filter(gym=gym)
            .values(
                "plan_id",
                "plan__plan_name",
            )
            .annotate(
                revenue=Sum("plan_price"),
                renewals=Count("id"),
            )
            .order_by("-revenue")
        )

        result = [
            {
                "plan_id": item["plan_id"],
                "plan_name": (
                    item["plan__plan_name"]
                    or "Deleted Plan"
                ),
                "revenue": item["revenue"] or 0,
                "renewals": item["renewals"],
            }
            for item in revenue_data
        ]

        return Response(result)


class RecentRenewalsView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsGymOwner,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)

        recent_renewals = (
            MembershipHistory.objects
            .filter(gym=gym)
            .select_related(
                "member",
                "plan",
                "created_by",
            )
            .order_by("-created_at")[:10]
        )

        result = [
            {
                "id": renewal.id,
                "member_id": renewal.member_id,
                "member_name": renewal.member.name,
                "member_phone": renewal.member.phone,
                "plan_id": renewal.plan_id,
                "plan_name": renewal.plan.plan_name,
                "plan_price": renewal.plan_price,
                "start_date": renewal.start_date,
                "end_date": renewal.end_date,
                "created_by": (
                    renewal.created_by.username
                    if renewal.created_by
                    else None
                ),
                "created_at": renewal.created_at,
            }
            for renewal in recent_renewals
        ]

        return Response({
            "count": len(result),
            "results": result,
        })