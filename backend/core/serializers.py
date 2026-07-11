from rest_framework import serializers
from .models import Gym, MembershipPlan, Member, Attendance, MembershipHistory, GymSettings, StaffProfile
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import transaction

class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = '__all__'


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = '__all__'
        read_only_fields = ['gym']


class MemberSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(
        source="plan.plan_name",
        read_only=True,
    )

    class Meta:
        model = Member
        fields = "__all__"
        read_only_fields = ["gym", "created_at"]

    def validate_phone(self, value):
        cleaned_phone = value.strip()

        if not cleaned_phone.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(cleaned_phone) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return cleaned_phone

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

        if joining_date and expiry_date and expiry_date < joining_date:
            raise serializers.ValidationError({
                "expiry_date": "Expiry date cannot be before joining date."
            })

        plan = attrs.get("plan", getattr(self.instance, "plan", None))
        request = self.context.get("request")

        if request and plan:
            gym = Gym.objects.filter(owner=request.user).first()

            if gym and plan.gym_id != gym.id:
                raise serializers.ValidationError({
                    "plan": "You cannot assign another gym's membership plan."
                })

        return attrs


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['gym']


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
            and closing_time == opening_time
        ):
            raise serializers.ValidationError({
                "closing_time": (
                    "Opening and closing times cannot be the same."
                )
            })

        return attrs


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
        value = value.strip()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already in use."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already in use."
            )

        return value

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

        duplicate_exists = (
            User.objects
            .filter(email__iexact=value)
            .exclude(id=staff_profile.user_id)
            .exists()
        )

        if duplicate_exists:
            raise serializers.ValidationError(
                "This email address is already in use."
            )

        return value.strip().lower()

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