from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Gym, MembershipPlan, Member, Attendance
from .serializers import MembershipPlanSerializer, MemberSerializer, AttendanceSerializer

from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


def get_user_gym(user):
    return Gym.objects.get(owner=user)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = get_user_gym(request.user)
        today = timezone.now().date()

        total_members = Member.objects.filter(gym=gym).count()
        active_members = Member.objects.filter(gym=gym, expiry_date__gte=today).count()
        expired_members = Member.objects.filter(gym=gym, expiry_date__lt=today).count()
        today_attendance = Attendance.objects.filter(gym=gym, date=today).count()

        return Response({
            "total_members": total_members,
            "active_members": active_members,
            "expired_members": expired_members,
            "today_attendance": today_attendance
        })


class MembershipPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return MembershipPlan.objects.filter(gym=gym)

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['id', 'name', 'joining_date', 'expiry_date', 'age']
    filterset_fields = ['gender', 'is_active', 'plan']

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return Member.objects.filter(gym=gym).order_by('-id')

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        gym = get_user_gym(self.request.user)
        return Attendance.objects.filter(gym=gym).order_by('-date')

    def perform_create(self, serializer):
        gym = get_user_gym(self.request.user)
        serializer.save(gym=gym)
