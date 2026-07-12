from django.db import models
from django.contrib.auth.models import User
from pathlib import Path
from uuid import uuid4
from django.utils import timezone

class Gym(models.Model):
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="gym_profile",
    )

    gym_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)

    # Your yearly software access dates
    access_start_date = models.DateField(
        null=True,
        blank=True,
    )

    access_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["gym_name"]

    @property
    def is_access_active(self):
        """
        Existing gyms without an expiry date remain active.
        Once an expiry date is added, access is checked automatically.
        """
        if not self.access_expiry_date:
            return True

        return self.access_expiry_date >= timezone.localdate()

    @property
    def access_status(self):
        return "active" if self.is_access_active else "expired"

    def __str__(self):
        return self.gym_name

class GymSettings(models.Model):
    CURRENCY_CHOICES = (
        ("INR", "Indian Rupee"),
        ("USD", "US Dollar"),
    )

    gym = models.OneToOneField(
        Gym,
        on_delete=models.CASCADE,
        related_name="settings",
    )

    opening_time = models.TimeField(
        null=True,
        blank=True,
    )

    closing_time = models.TimeField(
        null=True,
        blank=True,
    )

    currency = models.CharField(
        max_length=10,
        choices=CURRENCY_CHOICES,
        default="INR",
    )

    timezone = models.CharField(
        max_length=50,
        default="Asia/Kolkata",
    )

    gst_number = models.CharField(
        max_length=30,
        blank=True,
    )

    website = models.URLField(
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.gym.gym_name} settings"


class StaffProfile(models.Model):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("receptionist", "Receptionist"),
        ("trainer", "Trainer"),
    )

    gym = models.ForeignKey(
        Gym,
        on_delete=models.CASCADE,
        related_name="staff_members",
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["user__first_name", "user__username"]

        indexes = [
            models.Index(fields=["gym", "role"]),
            models.Index(fields=["gym", "is_active"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["gym", "user"],
                name="unique_staff_user_per_gym",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


class MembershipPlan(models.Model):
    gym = models.ForeignKey(
        Gym,
        on_delete=models.CASCADE,
        related_name="plans"
    )
    plan_name = models.CharField(max_length=100)
    duration_months = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["duration_months"]

        indexes = [
            models.Index(fields=["gym", "plan_name"]),
        ]

    def __str__(self):
        return self.plan_name

class MembershipHistory(models.Model):
    gym = models.ForeignKey(
        Gym,
        on_delete=models.CASCADE,
        related_name="membership_history",
    )

    member = models.ForeignKey(
        "Member",
        on_delete=models.CASCADE,
        related_name="membership_history",
    )

    plan = models.ForeignKey(
        MembershipPlan,
        on_delete=models.PROTECT,
        related_name="membership_history",
    )

    start_date = models.DateField()
    end_date = models.DateField()

    plan_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_membership_history",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["gym", "member"]),
            models.Index(fields=["gym", "end_date"]),
        ]

    def __str__(self):
        return (
            f"{self.member.name} - "
            f"{self.plan.plan_name} - "
            f"{self.start_date} to {self.end_date}"
        )

def member_photo_upload_path(instance, filename):
    extension = Path(filename).suffix.lower()

    if not extension:
        extension = ".jpg"

    unique_filename = f"{uuid4().hex}{extension}"

    return (
        f"gyms/{instance.gym_id}/"
        f"members/photos/{unique_filename}"
    )


class ActiveMemberManager(models.Manager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(is_deleted=False)
        )

class Member(models.Model):
    GENDER_CHOICES = (
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    )

    gym = models.ForeignKey(
        Gym,
        on_delete=models.CASCADE,
        related_name="members",
    )

    plan = models.ForeignKey(
        MembershipPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    age = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
    )

    address = models.TextField(blank=True)

    photo = models.ImageField(
        upload_to=member_photo_upload_path,
        null=True,
        blank=True,
    )

    joining_date = models.DateField()
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)

    is_deleted = models.BooleanField(default=False)

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deleted_members",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    objects = ActiveMemberManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ["-id"]

        indexes = [
            models.Index(
                fields=["gym", "name"],
                name="member_gym_name_idx",
            ),
            models.Index(
                fields=["gym", "phone"],
                name="member_gym_phone_idx",
            ),
            models.Index(
                fields=["gym", "expiry_date"],
                name="member_gym_expiry_idx",
            ),
            models.Index(
                fields=["gym", "is_active"],
                name="member_gym_active_idx",
            ),
            models.Index(
                fields=["gym", "is_deleted"],
                name="member_gym_deleted_idx",
            ),
        ]

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user

        self.save(
            update_fields=[
                "is_deleted",
                "deleted_at",
                "deleted_by",
            ]
        )

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None

        self.save(
            update_fields=[
                "is_deleted",
                "deleted_at",
                "deleted_by",
            ]
        )

    def __str__(self):
        return self.name

class Attendance(models.Model):
    gym = models.ForeignKey(
        Gym,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    date = models.DateField()

    check_in_time = models.TimeField(auto_now_add=True)

    check_out_time = models.TimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-check_in_time"]

        constraints = [
            models.UniqueConstraint(
                fields=["gym", "member", "date"],
                name="unique_daily_attendance"
            )
        ]

        indexes = [
            models.Index(fields=["gym", "date"]),
            models.Index(fields=["member", "date"]),
        ]

    def __str__(self):
        return f"{self.member.name} - {self.date}"