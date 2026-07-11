from django.contrib import admin

from .models import (
    Attendance,
    Gym,
    Member,
    MembershipPlan,
    StaffProfile,
)


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = (
        "gym_name",
        "owner_name",
        "email",
        "phone",
        "created_at",
    )
    search_fields = ("gym_name", "owner_name", "email", "phone")


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "gym",
        "role",
        "phone",
        "is_active",
    )
    list_filter = ("role", "is_active", "gym")
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "phone",
    )


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = (
        "plan_name",
        "gym",
        "duration_months",
        "price",
    )
    list_filter = ("gym",)
    search_fields = ("plan_name",)


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "gym",
        "phone",
        "plan",
        "joining_date",
        "expiry_date",
        "is_active",
    )
    list_filter = ("gym", "gender", "is_active", "plan")
    search_fields = ("name", "phone", "email")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "member",
        "gym",
        "date",
        "check_in_time",
        "check_out_time",
    )
    list_filter = ("gym", "date")
    search_fields = ("member__name", "member__phone")