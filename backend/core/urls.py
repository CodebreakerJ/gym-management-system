from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views.member_views import MemberViewSet
from core.views.membership_views import MembershipPlanViewSet
from core.views.attendance_views import (
    AttendanceViewSet,
    MemberCheckInView,
    MemberCheckOutView,
    TodayAttendanceView,
    AttendanceHistoryView,
)
from core.views.dashboard_views import (
    DashboardSummaryView,
    MembershipDistributionView,
    RecentMembersView,
    ExpiringSoonView,
    MonthlyMemberGrowthView,
)
from core.views.report_views import (
    ActiveMembersReportView,
    ExpiredMembersReportView,
)

router = DefaultRouter()
router.register("members", MemberViewSet, basename="members")
router.register("plans", MembershipPlanViewSet, basename="plans")
router.register("attendance", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),

    path("dashboard/summary/", DashboardSummaryView.as_view()),
    path("dashboard/membership-distribution/", MembershipDistributionView.as_view()),
    path("dashboard/recent-members/", RecentMembersView.as_view()),
    path("dashboard/expiring-soon/", ExpiringSoonView.as_view()),
    path("dashboard/member-growth/", MonthlyMemberGrowthView.as_view()),

    path("attendance/check-in/<int:member_id>/", MemberCheckInView.as_view()),
    path("attendance/check-out/<int:member_id>/", MemberCheckOutView.as_view()),
    path("attendance/today/", TodayAttendanceView.as_view()),
    path("attendance/history/", AttendanceHistoryView.as_view()),

    path("reports/active-members/", ActiveMembersReportView.as_view()),
    path("reports/expired-members/", ExpiredMembersReportView.as_view()),
]