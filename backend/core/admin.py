from django.contrib import admin

from .models import (
    Attendance,
    Gym,
    GymSettings,
    Member,
    MembershipHistory,
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
        "access_start_date",
        "access_expiry_date",
        "display_access_status",
        "created_at",
    )

    list_filter = (
        "access_start_date",
        "access_expiry_date",
    )

    search_fields = (
        "gym_name",
        "owner_name",
        "email",
        "phone",
        "owner__username",
    )

    readonly_fields = (
        "created_at",
        "display_access_status",
    )

    @admin.display(
        description="Software Access",
        boolean=True,
    )
    def display_access_status(self, obj):
        return obj.is_access_active


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
        "is_deleted",
    )

    list_filter = (
        "gym",
        "gender",
        "is_active",
        "is_deleted",
        "plan",
    )

    search_fields = (
        "name",
        "phone",
        "email",
        "address",
        "plan__plan_name",
    )

    readonly_fields = (
        "deleted_at",
        "deleted_by",
        "created_at",
    )

    def get_queryset(self, request):
        return Member.all_objects.select_related(
            "gym",
            "plan",
            "deleted_by",
        )

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

@admin.register(MembershipHistory)
class MembershipHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "member",
        "gym",
        "plan",
        "start_date",
        "end_date",
        "plan_price",
        "created_by",
        "created_at",
    )

    list_filter = (
        "gym",
        "plan",
        "start_date",
        "end_date",
    )

    search_fields = (
        "member__name",
        "member__phone",
        "plan__plan_name",
    )

    readonly_fields = (
        "created_at",
    )

@admin.register(GymSettings)
class GymSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "gym",
        "opening_time",
        "closing_time",
        "currency",
        "timezone",
        "updated_at",
    )

    search_fields = (
        "gym__gym_name",
        "gst_number",
    )

    list_filter = (
        "currency",
        "timezone",
    )    