from django.db import models
from django.contrib.auth.models import User


class Gym(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    gym_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.gym_name


class MembershipPlan(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    plan_name = models.CharField(max_length=100)
    duration_months = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.plan_name


class Member(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True, blank=True)

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)

    joining_date = models.DateField()
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Attendance(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    date = models.DateField()
    check_in_time = models.TimeField(auto_now_add=True)
    check_out_time = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ("gym", "member", "date")

    def __str__(self):
        return f"{self.member.name} - {self.date}"