from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from core.models import (
    Attendance,
    Gym,
    GymSettings,
    Member,
    MembershipHistory,
    MembershipPlan,
    StaffProfile,
)
from core.utils.helpers import get_user_gym


class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = "__all__"


class GymProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = [
            "id",
            "gym_name",
            "owner_name",
            "email",
            "phone",
            "address",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate_phone(self, value):
        phone = value.strip()

        if not phone.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(phone) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return phone


class GymSettingsSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(
        source="gym.gym_name",
        read_only=True,
    )

    class Meta:
        model = GymSettings
        fields = [
            "id",
            "gym",
            "gym_name",
            "opening_time",
            "closing_time",
            "currency",
            "timezone",
            "gst_number",
            "website",
            "description",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "gym",
            "gym_name",
            "updated_at",
        ]

    def validate(self, attrs):
        opening_time = attrs.get(
            "opening_time",
            getattr(self.instance, "opening_time", None),
        )
        closing_time = attrs.get(
            "closing_time",
            getattr(self.instance, "closing_time", None),
        )

        if (
            opening_time
            and closing_time
            and opening_time == closing_time
        ):
            raise serializers.ValidationError({
                "closing_time": (
                    "Opening and closing times cannot be the same."
                )
            })

        return attrs


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            "id",
            "gym",
            "plan_name",
            "duration_months",
            "price",
        ]
        read_only_fields = [
            "id",
            "gym",
        ]

    def validate_plan_name(self, value):
        plan_name = value.strip()

        if len(plan_name) < 2:
            raise serializers.ValidationError(
                "Plan name must contain at least 2 characters."
            )

        return plan_name

    def validate_duration_months(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Plan duration must be greater than zero."
            )

        if value > 60:
            raise serializers.ValidationError(
                "Plan duration cannot exceed 60 months."
            )

        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Plan price cannot be negative."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")
        plan_name = attrs.get(
            "plan_name",
            getattr(self.instance, "plan_name", None),
        )

        if request and request.user.is_authenticated and plan_name:
            gym = get_user_gym(request.user)

            duplicate_plans = MembershipPlan.objects.filter(
                gym=gym,
                plan_name__iexact=plan_name,
            )

            if self.instance:
                duplicate_plans = duplicate_plans.exclude(
                    id=self.instance.id
                )

            if duplicate_plans.exists():
                raise serializers.ValidationError({
                    "plan_name": (
                        "A membership plan with this name already exists."
                    )
                })

        return attrs


class MemberSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(
        source="plan.plan_name",
        read_only=True,
    )
    membership_status = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            "id",
            "gym",
            "plan",
            "plan_name",
            "name",
            "phone",
            "email",
            "age",
            "gender",
            "address",
            "joining_date",
            "expiry_date",
            "is_active",
            "membership_status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "gym",
            "is_active",
            "membership_status",
            "created_at",
        ]

    def get_membership_status(self, obj):
        today = timezone.localdate()

        if obj.expiry_date < today:
            return "expired"

        if obj.expiry_date <= today + timedelta(days=7):
            return "expiring_soon"

        return "active"

    def validate_name(self, value):
        name = value.strip()

        if len(name) < 2:
            raise serializers.ValidationError(
                "Member name must contain at least 2 characters."
            )

        return name

    def validate_phone(self, value):
        phone = value.strip()

        if not phone.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(phone) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            gym = get_user_gym(request.user)

            duplicate_members = Member.objects.filter(
                gym=gym,
                phone=phone,
            )

            if self.instance:
                duplicate_members = duplicate_members.exclude(
                    id=self.instance.id
                )

            if duplicate_members.exists():
                raise serializers.ValidationError(
                    "A member with this phone number already exists "
                    "in your gym."
                )

        return phone

    def validate_email(self, value):
        return value.strip().lower()

    def validate_age(self, value):
        if value is not None and not 14 <= value <= 100:
            raise serializers.ValidationError(
                "Age must be between 14 and 100."
            )

        return value

    def validate(self, attrs):
        joining_date = attrs.get(
            "joining_date",
            getattr(self.instance, "joining_date", None),
        )
        expiry_date = attrs.get(
            "expiry_date",
            getattr(self.instance, "expiry_date", None),
        )

        if (
            joining_date
            and expiry_date
            and expiry_date < joining_date
        ):
            raise serializers.ValidationError({
                "expiry_date": (
                    "Expiry date cannot be before joining date."
                )
            })

        plan = attrs.get(
            "plan",
            getattr(self.instance, "plan", None),
        )
        request = self.context.get("request")

        if request and request.user.is_authenticated and plan:
            gym = get_user_gym(request.user)

            if plan.gym_id != gym.id:
                raise serializers.ValidationError({
                    "plan": (
                        "This membership plan does not belong "
                        "to your gym."
                    )
                })

        return attrs

    def create(self, validated_data):
        validated_data["is_active"] = (
            validated_data["expiry_date"]
            >= timezone.localdate()
        )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        expiry_date = validated_data.get(
            "expiry_date",
            instance.expiry_date,
        )

        validated_data["is_active"] = (
            expiry_date >= timezone.localdate()
        )

        return super().update(instance, validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(
        source="member.name",
        read_only=True,
    )
    member_phone = serializers.CharField(
        source="member.phone",
        read_only=True,
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "gym",
            "member",
            "member_name",
            "member_phone",
            "date",
            "check_in_time",
            "check_out_time",
        ]
        read_only_fields = [
            "id",
            "gym",
            "member_name",
            "member_phone",
            "check_in_time",
        ]

    def validate_member(self, member):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        gym = get_user_gym(request.user)

        if member.gym_id != gym.id:
            raise serializers.ValidationError(
                "This member does not belong to your gym."
            )

        return member

    def validate(self, attrs):
        member = attrs.get(
            "member",
            getattr(self.instance, "member", None),
        )
        attendance_date = attrs.get(
            "date",
            getattr(self.instance, "date", None),
        )
        check_out_time = attrs.get(
            "check_out_time",
            getattr(self.instance, "check_out_time", None),
        )

        if (
            attendance_date
            and attendance_date > timezone.localdate()
        ):
            raise serializers.ValidationError({
                "date": (
                    "Attendance cannot be marked for a future date."
                )
            })

        if member and attendance_date and not self.instance:
            duplicate_exists = Attendance.objects.filter(
                member=member,
                date=attendance_date,
            ).exists()

            if duplicate_exists:
                raise serializers.ValidationError({
                    "member": (
                        "Attendance is already recorded "
                        "for this member on this date."
                    )
                })

        if check_out_time and self.instance:
            if not self.instance.check_in_time:
                raise serializers.ValidationError({
                    "check_out_time": (
                        "A member cannot check out before checking in."
                    )
                })

        return attrs


class MembershipHistorySerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(
        source="member.name",
        read_only=True,
    )
    plan_name = serializers.CharField(
        source="plan.plan_name",
        read_only=True,
    )
    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True,
        default=None,
    )

    class Meta:
        model = MembershipHistory
        fields = [
            "id",
            "gym",
            "member",
            "member_name",
            "plan",
            "plan_name",
            "start_date",
            "end_date",
            "plan_price",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "gym",
            "member",
            "plan_price",
            "created_by",
            "created_at",
        ]


class MembershipRenewalSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    start_date = serializers.DateField(required=False)
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )


class StaffSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )
    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "user",
            "username",
            "first_name",
            "last_name",
            "email",
            "gym",
            "role",
            "phone",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "gym",
            "created_at",
        ]


class StaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    first_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )
    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    role = serializers.ChoiceField(
        choices=StaffProfile.ROLE_CHOICES,
    )

    def validate_username(self, value):
        username = value.strip()

        if User.objects.filter(
            username__iexact=username
        ).exists():
            raise serializers.ValidationError(
                "This username is already in use."
            )

        return username

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "This email address is already in use."
            )

        return email

    def validate_phone(self, value):
        phone = value.strip()

        if not phone.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(phone) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return phone

    @transaction.atomic
    def create(self, validated_data):
        gym = self.context["gym"]

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data["email"],
        )

        return StaffProfile.objects.create(
            gym=gym,
            user=user,
            role=validated_data["role"],
            phone=validated_data["phone"],
            is_active=True,
        )


class StaffUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )
    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(
        required=False,
        max_length=15,
    )
    role = serializers.ChoiceField(
        choices=StaffProfile.ROLE_CHOICES,
        required=False,
    )
    is_active = serializers.BooleanField(required=False)
    password = serializers.CharField(
        required=False,
        write_only=True,
        min_length=8,
    )

    def validate_phone(self, value):
        phone = value.strip()

        if not phone.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(phone) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return phone

    def validate_email(self, value):
        staff_profile = self.context["staff_profile"]
        email = value.strip().lower()

        duplicate_exists = (
            User.objects
            .filter(email__iexact=email)
            .exclude(id=staff_profile.user_id)
            .exists()
        )

        if duplicate_exists:
            raise serializers.ValidationError(
                "This email address is already in use."
            )

        return email

    @transaction.atomic
    def update(self, instance, validated_data):
        user = instance.user

        user.first_name = validated_data.get(
            "first_name",
            user.first_name,
        )
        user.last_name = validated_data.get(
            "last_name",
            user.last_name,
        )
        user.email = validated_data.get(
            "email",
            user.email,
        )

        password = validated_data.get("password")

        if password:
            user.set_password(password)

        if "is_active" in validated_data:
            user.is_active = validated_data["is_active"]

        user.save()

        instance.phone = validated_data.get(
            "phone",
            instance.phone,
        )
        instance.role = validated_data.get(
            "role",
            instance.role,
        )
        instance.is_active = validated_data.get(
            "is_active",
            instance.is_active,
        )
        instance.save()

        return instance