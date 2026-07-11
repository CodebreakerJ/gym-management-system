from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import (
    Attendance,
    Gym,
    Member,
    MembershipHistory,
    MembershipPlan,
    StaffProfile,
)


class GymManagementAPITests(APITestCase):
    def setUp(self):
        today = timezone.localdate()

        # Gym owner 1
        self.owner_one = User.objects.create_user(
            username="owner_one",
            password="Owner@123",
            email="owner1@example.com",
        )

        self.gym_one = Gym.objects.create(
            owner=self.owner_one,
            gym_name="Power House Gym",
            owner_name="Owner One",
            email="owner1@example.com",
            phone="9876543210",
            address="Indore",
        )

        # Gym owner 2
        self.owner_two = User.objects.create_user(
            username="owner_two",
            password="Owner@123",
            email="owner2@example.com",
        )

        self.gym_two = Gym.objects.create(
            owner=self.owner_two,
            gym_name="Fitness Club",
            owner_name="Owner Two",
            email="owner2@example.com",
            phone="9876543211",
            address="Bhopal",
        )

        # Receptionist for gym one
        self.reception_user = User.objects.create_user(
            username="reception_one",
            password="Reception@123",
            email="reception@example.com",
        )

        self.reception_profile = StaffProfile.objects.create(
            gym=self.gym_one,
            user=self.reception_user,
            role="receptionist",
            phone="9876543212",
            is_active=True,
        )

        # Plans
        self.plan_one = MembershipPlan.objects.create(
            gym=self.gym_one,
            plan_name="Monthly",
            duration_months=1,
            price=1000,
        )

        self.plan_two = MembershipPlan.objects.create(
            gym=self.gym_two,
            plan_name="Yearly",
            duration_months=12,
            price=8000,
        )

        # Members
        self.member_one = Member.objects.create(
            gym=self.gym_one,
            plan=self.plan_one,
            name="Rahul Sharma",
            phone="9999999991",
            email="rahul@example.com",
            age=25,
            gender="Male",
            address="Indore",
            joining_date=today,
            expiry_date=today + timedelta(days=30),
            is_active=True,
        )

        self.member_two = Member.objects.create(
            gym=self.gym_two,
            plan=self.plan_two,
            name="Amit Verma",
            phone="9999999992",
            email="amit@example.com",
            age=28,
            gender="Male",
            address="Bhopal",
            joining_date=today,
            expiry_date=today + timedelta(days=365),
            is_active=True,
        )

    def test_owner_sees_only_own_gym_members(self):
        self.client.force_authenticate(user=self.owner_one)

        response = self.client.get("/api/members/?page_size=100")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        returned_ids = [member["id"] for member in results]

        self.assertIn(self.member_one.id, returned_ids)
        self.assertNotIn(self.member_two.id, returned_ids)

    def test_duplicate_phone_is_blocked_in_same_gym(self):
        self.client.force_authenticate(user=self.owner_one)

        payload = {
            "plan": self.plan_one.id,
            "name": "Duplicate Member",
            "phone": self.member_one.phone,
            "email": "duplicate@example.com",
            "age": 30,
            "gender": "Male",
            "address": "Indore",
            "joining_date": str(timezone.localdate()),
            "expiry_date": str(
                timezone.localdate() + timedelta(days=30)
            ),
        }

        response = self.client.post(
            "/api/members/",
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("phone", response.data)

    def test_another_gym_plan_cannot_be_assigned(self):
        self.client.force_authenticate(user=self.owner_one)

        payload = {
            "plan": self.plan_two.id,
            "name": "Invalid Plan Member",
            "phone": "9999999993",
            "email": "invalid@example.com",
            "age": 24,
            "gender": "Male",
            "address": "Indore",
            "joining_date": str(timezone.localdate()),
            "expiry_date": str(
                timezone.localdate() + timedelta(days=30)
            ),
        }

        response = self.client.post(
            "/api/members/",
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("plan", response.data)

    def test_receptionist_cannot_access_revenue(self):
        self.client.force_authenticate(user=self.reception_user)

        response = self.client.get(
            "/api/dashboard/revenue-summary/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_member_check_in_and_duplicate_check_in(self):
        self.client.force_authenticate(user=self.owner_one)

        url = (
            f"/api/attendance/check-in/"
            f"{self.member_one.id}/"
        )

        first_response = self.client.post(url)
        second_response = self.client.post(url)

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Attendance.objects.filter(
                gym=self.gym_one,
                member=self.member_one,
                date=timezone.localdate(),
            ).count(),
            1,
        )

    def test_check_out_without_check_in_is_blocked(self):
        self.client.force_authenticate(user=self.owner_one)

        response = self.client.post(
            f"/api/attendance/check-out/"
            f"{self.member_one.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_membership_renewal_creates_history(self):
        self.client.force_authenticate(user=self.owner_one)

        old_expiry_date = self.member_one.expiry_date

        response = self.client.post(
            f"/api/members/{self.member_one.id}/renew/",
            {
                "plan_id": self.plan_one.id,
                "notes": "Renewed during automated test",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            MembershipHistory.objects.filter(
                gym=self.gym_one,
                member=self.member_one,
            ).count(),
            1,
        )

        self.member_one.refresh_from_db()

        self.assertGreater(
            self.member_one.expiry_date,
            old_expiry_date,
        )

    def test_revenue_summary_uses_membership_history(self):
        MembershipHistory.objects.create(
            gym=self.gym_one,
            member=self.member_one,
            plan=self.plan_one,
            start_date=timezone.localdate(),
            end_date=timezone.localdate() + timedelta(days=30),
            plan_price=1000,
            notes="Revenue test",
            created_by=self.owner_one,
        )

        self.client.force_authenticate(user=self.owner_one)

        response = self.client.get(
            "/api/dashboard/revenue-summary/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            float(response.data["total_revenue"]),
            1000.0,
        )