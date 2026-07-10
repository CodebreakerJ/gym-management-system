from django.utils import timezone
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Attendance, Member
from core.serializers import AttendanceSerializer
from core.utils.helpers import get_user_gym


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return Attendance.objects.filter(gym=gym).order_by("-date")

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)


class MemberCheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, member_id):
        gym = get_user_gym(request.user)
        today = timezone.now().date()

        try:
            member = Member.objects.get(id=member_id, gym=gym)
        except Member.DoesNotExist:
            return Response({"error": "Member not found"}, status=404)

        attendance, created = Attendance.objects.get_or_create(
            gym=gym,
            member=member,
            date=today
        )

        if not created:
            return Response({"message": "Member already checked in today"})

        return Response({"message": "Check-in successful"})


class MemberCheckOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, member_id):
        gym = get_user_gym(request.user)
        today = timezone.now().date()
        now_time = timezone.now().time()

        try:
            attendance = Attendance.objects.get(
                gym=gym,
                member_id=member_id,
                date=today
            )
        except Attendance.DoesNotExist:
            return Response({"error": "Member has not checked in today"}, status=404)

        if attendance.check_out_time:
            return Response({"message": "Member already checked out today"})

        attendance.check_out_time = now_time
        attendance.save()

        return Response({"message": "Check-out successful"})


class TodayAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()

        attendance = (
            Attendance.objects.filter(gym=gym, date=today)
            .select_related("member")
            .order_by("-check_in_time")
        )

        return Response([
            {
                "id": item.id,
                "member_id": item.member.id,
                "name": item.member.name,
                "phone": item.member.phone,
                "date": item.date,
                "check_in_time": item.check_in_time,
                "check_out_time": item.check_out_time,
            }
            for item in attendance
        ])


class AttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)

        attendance = (
            Attendance.objects.filter(gym=gym)
            .select_related("member")
            .order_by("-date", "-check_in_time")[:100]
        )

        return Response([
            {
                "id": item.id,
                "member_id": item.member.id,
                "name": item.member.name,
                "phone": item.member.phone,
                "date": item.date,
                "check_in_time": item.check_in_time,
                "check_out_time": item.check_out_time,
            }
            for item in attendance
        ])