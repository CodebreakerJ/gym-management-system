from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardStatsView, MemberViewSet, MembershipPlanViewSet, AttendanceViewSet

router = DefaultRouter()
router.register('members', MemberViewSet, basename='members')
router.register('plans', MembershipPlanViewSet, basename='plans')
router.register('attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view()),
    path('', include(router.urls)),
]