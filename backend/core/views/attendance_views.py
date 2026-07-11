from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Attendance, Member
from core.permissions import IsOwnerOrReceptionist
from core.serializers import AttendanceSerializer
from core.utils.helpers import get_user_gym


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)

        return (
            Attendance.objects
            .filter(gym=gym)
            .select_related("member")
            .order_by("-date", "-check_in_time")
        )

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        member = serializer.validated_data["member"]

        if member.gym_id != gym.id:
            raise ValidationError({
                "member": "This member does not belong to your gym."
            })

        serializer.save(gym=gym)


class MemberCheckInView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def post(self, request, member_id):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        try:
            member = Member.objects.get(
                id=member_id,
                gym=gym,
            )
        except Member.DoesNotExist:
            return Response(
                {"detail": "Member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if member.expiry_date < today:
            return Response(
                {
                    "detail": (
                        "This member's membership has expired. "
                        "Renew the membership before check-in."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance, created = Attendance.objects.get_or_create(
            gym=gym,
            member=member,
            date=today,
        )

        if not created:
            return Response(
                {
                    "detail": "Member has already checked in today.",
                    "attendance_id": attendance.id,
                    "check_in_time": attendance.check_in_time,
                    "check_out_time": attendance.check_out_time,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Check-in successful.",
                "attendance": AttendanceSerializer(
                    attendance
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MemberCheckOutView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def post(self, request, member_id):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        try:
            attendance = Attendance.objects.select_related(
                "member"
            ).get(
                gym=gym,
                member_id=member_id,
                date=today,
            )
        except Attendance.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Member has not checked in today."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if attendance.check_out_time:
            return Response(
                {
                    "detail": (
                        "Member has already checked out today."
                    ),
                    "check_out_time": attendance.check_out_time,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance.check_out_time = timezone.localtime().time()
        attendance.save(update_fields=["check_out_time"])

        return Response({
            "message": "Check-out successful.",
            "attendance": AttendanceSerializer(attendance).data,
        })


class TodayAttendanceView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.localdate()

        attendance = (
            Attendance.objects
            .filter(
                gym=gym,
                date=today,
            )
            .select_related("member")
            .order_by("-check_in_time")
        )

        serializer = AttendanceSerializer(
            attendance,
            many=True,
        )

        return Response({
            "date": today,
            "count": attendance.count(),
            "results": serializer.data,
        })


class AttendanceHistoryView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReceptionist,
    ]

    def get(self, request):
        gym = get_user_gym(request.user)

        attendance_date = request.query_params.get("date")
        member_id = request.query_params.get("member_id")

        attendance = (
            Attendance.objects
            .filter(gym=gym)
            .select_related("member")
            .order_by("-date", "-check_in_time")
        )

        if attendance_date:
            attendance = attendance.filter(
                date=attendance_date
            )

        if member_id:
            attendance = attendance.filter(
                member_id=member_id
            )

        attendance = attendance[:100]

        serializer = AttendanceSerializer(
            attendance,
            many=True,
        )

        return Response({
            "count": len(serializer.data),
            "results": serializer.data,
        })