from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Member
from core.utils.helpers import get_user_gym


class ActiveMembersReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()

        members = Member.objects.filter(gym=gym, expiry_date__gte=today)

        return Response([
            {
                "id": member.id,
                "name": member.name,
                "phone": member.phone,
                "expiry_date": member.expiry_date,
                "status": "Active",
            }
            for member in members
        ])


class ExpiredMembersReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()

        members = Member.objects.filter(gym=gym, expiry_date__lt=today)

        return Response([
            {
                "id": member.id,
                "name": member.name,
                "phone": member.phone,
                "expiry_date": member.expiry_date,
                "status": "Expired",
            }
            for member in members
        ])