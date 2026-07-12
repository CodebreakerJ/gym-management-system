from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views.member_views import MemberViewSet
from core.views.membership_views import MembershipPlanViewSet
from core.views.auth_views import LogoutView

from core.views.gym_views import (
    GymProfileView,
    GymSettingsView,
)

from core.views.staff_views import (
    StaffDetailView,
    StaffListCreateView,
)
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
from core.views.renewal_views import (
    AllMembershipHistoryView,
    MemberMembershipHistoryView,
    RenewMembershipView,
)
from core.views.revenue_views import (
    MonthlyRevenueChartView,
    PlanWiseRevenueView,
    RecentRenewalsView,
    RevenueSummaryView,
)
from core.views.graph_views import (
    AgeDistributionView,
    AttendanceTrendView,
    ExpiryTrendView,
    GenderDistributionView,
)

from core.views.notification_views import (
    AbsentMembersNotificationView,
    ExpiredMembersNotificationView,
    ExpiringMembersNotificationView,
    NotificationSummaryView,
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
    path("members/<int:member_id>/renew/",RenewMembershipView.as_view(),name="renew-membership",),
    path("members/<int:member_id>/membership-history/", MemberMembershipHistoryView.as_view(), name="member-membership-history",),
    path("membership-history/",AllMembershipHistoryView.as_view(), name="all-membership-history",),
    path(
    "logout/",
    LogoutView.as_view(),
    name="logout",
),

path(
    "gym/profile/",
    GymProfileView.as_view(),
    name="gym-profile",
),

path(
    "gym/settings/",
    GymSettingsView.as_view(),
    name="gym-settings",
),

path(
    "staff/",
    StaffListCreateView.as_view(),
    name="staff-list-create",
),

path(
    "staff/<int:staff_id>/",
    StaffDetailView.as_view(),
    name="staff-detail",
),
path(
    "dashboard/revenue-summary/",
    RevenueSummaryView.as_view(),
    name="revenue-summary",
),

path(
    "dashboard/monthly-revenue/",
    MonthlyRevenueChartView.as_view(),
    name="monthly-revenue",
),

path(
    "dashboard/plan-wise-revenue/",
    PlanWiseRevenueView.as_view(),
    name="plan-wise-revenue",
),

path(
    "dashboard/recent-renewals/",
    RecentRenewalsView.as_view(),
    name="recent-renewals",
),
path(
    "dashboard/gender-distribution/",
    GenderDistributionView.as_view(),
    name="gender-distribution",
),

path(
    "dashboard/age-distribution/",
    AgeDistributionView.as_view(),
    name="age-distribution",
),

path(
    "dashboard/attendance-trend/",
    AttendanceTrendView.as_view(),
    name="attendance-trend",
),

path(
    "dashboard/expiry-trend/",
    ExpiryTrendView.as_view(),
    name="expiry-trend",
),

path(
    "notifications/summary/",
    NotificationSummaryView.as_view(),
    name="notification-summary",
),

path(
    "notifications/expiring-members/",
    ExpiringMembersNotificationView.as_view(),
    name="expiring-member-notifications",
),

path(
    "notifications/absent-members/",
    AbsentMembersNotificationView.as_view(),
    name="absent-member-notifications",
),

path(
    "notifications/expired-members/",
    ExpiredMembersNotificationView.as_view(),
    name="expired-member-notifications",
),
]