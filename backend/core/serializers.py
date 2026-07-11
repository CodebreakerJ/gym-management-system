from rest_framework import serializers
from .models import Gym, MembershipPlan, Member, Attendance
from django.utils import timezone

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