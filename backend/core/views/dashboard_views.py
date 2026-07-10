from datetime import timedelta
from django.db.models import Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Member, Attendance
from core.utils.helpers import get_user_gym


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()
        start_month = today.replace(day=1)
        next_7_days = today + timedelta(days=7)

        return Response({
            "total_members": Member.objects.filter(gym=gym).count(),
            "active_members": Member.objects.filter(gym=gym, expiry_date__gte=today).count(),
            "expired_members": Member.objects.filter(gym=gym, expiry_date__lt=today).count(),
            "today_attendance": Attendance.objects.filter(gym=gym, date=today).count(),
            "new_members_this_month": Member.objects.filter(gym=gym, joining_date__gte=start_month).count(),
            "expiring_next_7_days": Member.objects.filter(
                gym=gym,
                expiry_date__gte=today,
                expiry_date__lte=next_7_days
            ).count(),
        })


class MembershipDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        data = (
            Member.objects.filter(gym=gym)
            .values("plan__plan_name")
            .annotate(members=Count("id"))
        )

        return Response([
            {
                "plan": item["plan__plan_name"] or "No Plan",
                "members": item["members"]
            }
            for item in data
        ])


class RecentMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        members = (
            Member.objects.filter(gym=gym)
            .select_related("plan")
            .order_by("-joining_date")[:5]
        )

        return Response([
            {
                "id": member.id,
                "name": member.name,
                "phone": member.phone,
                "plan": member.plan.plan_name if member.plan else "No Plan",
                "joining_date": member.joining_date,
            }
            for member in members
        ])


class ExpiringSoonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()
        next_7_days = today + timedelta(days=7)

        members = (
            Member.objects.filter(
                gym=gym,
                expiry_date__gte=today,
                expiry_date__lte=next_7_days
            )
            .select_related("plan")
            .order_by("expiry_date")[:10]
        )

        return Response([
            {
                "id": member.id,
                "name": member.name,
                "phone": member.phone,
                "plan": member.plan.plan_name if member.plan else "No Plan",
                "expiry_date": member.expiry_date,
            }
            for member in members
        ])


class MonthlyMemberGrowthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        data = (
            Member.objects.filter(gym=gym)
            .extra(select={"month": "strftime('%%Y-%%m', joining_date)"})
            .values("month")
            .annotate(members=Count("id"))
            .order_by("month")
        )

        return Response([
            {
                "month": item["month"],
                "members": item["members"]
            }
            for item in data
        ])