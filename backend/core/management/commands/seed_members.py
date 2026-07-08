from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from faker import Faker
from random import choice, randint
from datetime import timedelta
from django.utils import timezone

from core.models import Gym, MembershipPlan, Member


class Command(BaseCommand):
    help = "Create 1000 dummy members"

    def handle(self, *args, **kwargs):
        fake = Faker("en_IN")

        user = User.objects.first()

        if not user:
            self.stdout.write(self.style.ERROR("Please create a user first"))
            return

        gym, created = Gym.objects.get_or_create(
            owner=user,
            defaults={
                "gym_name": "My Gym",
                "owner_name": user.username,
                "email": fake.email(),
                "phone": fake.phone_number()[:15],
                "address": fake.address(),
            }
        )

        plans = [
            {"plan_name": "Monthly", "duration_months": 1, "price": 1000},
            {"plan_name": "Quarterly", "duration_months": 3, "price": 2500},
            {"plan_name": "Yearly", "duration_months": 12, "price": 8000},
        ]

        for plan in plans:
            MembershipPlan.objects.get_or_create(
                gym=gym,
                plan_name=plan["plan_name"],
                defaults={
                    "duration_months": plan["duration_months"],
                    "price": plan["price"],
                }
            )

        all_plans = MembershipPlan.objects.filter(gym=gym)

        for i in range(1000):
            plan = choice(all_plans)
            joining_date = timezone.now().date() - timedelta(days=randint(1, 400))
            expiry_date = joining_date + timedelta(days=plan.duration_months * 30)

            Member.objects.create(
                gym=gym,
                plan=plan,
                name=fake.name(),
                phone=str(fake.random_number(digits=10, fix_len=True)),
                email=fake.email(),
                age=randint(18, 55),
                gender=choice(["Male", "Female", "Other"]),
                address=fake.city(),
                joining_date=joining_date,
                expiry_date=expiry_date,
                is_active=expiry_date >= timezone.now().date(),
            )

        self.stdout.write(self.style.SUCCESS("1000 dummy members created successfully"))