from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
)

from core.models import Gym, StaffProfile


def validate_gym_access(gym):
    if not gym.is_access_active:
        raise PermissionDenied(
            "Your gym software access has expired. "
            "Please contact the software administrator to renew it."
        )

    return gym


def get_user_gym(user):
    if not user or not user.is_authenticated:
        raise PermissionDenied(
            "Authentication is required."
        )

    owner_gym = Gym.objects.filter(
        owner=user
    ).first()

    if owner_gym:
        return validate_gym_access(owner_gym)

    staff_profile = (
        StaffProfile.objects
        .select_related("gym")
        .filter(
            user=user,
            is_active=True,
            user__is_active=True,
        )
        .first()
    )

    if staff_profile:
        return validate_gym_access(
            staff_profile.gym
        )

    raise NotFound(
        "No active gym is associated with this user."
    )


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None

    owner_gym = Gym.objects.filter(
        owner=user
    ).first()

    if owner_gym:
        if not owner_gym.is_access_active:
            return None

        return "owner"

    staff_profile = (
        StaffProfile.objects
        .select_related("gym")
        .filter(
            user=user,
            is_active=True,
            user__is_active=True,
        )
        .first()
    )

    if (
        staff_profile
        and staff_profile.gym.is_access_active
    ):
        return staff_profile.role

    return None