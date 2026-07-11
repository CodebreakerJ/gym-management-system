from rest_framework.exceptions import NotFound, PermissionDenied

from core.models import Gym, StaffProfile


def get_user_gym(user):
    if not user or not user.is_authenticated:
        raise PermissionDenied("Authentication is required.")

    owner_gym = Gym.objects.filter(owner=user).first()

    if owner_gym:
        return owner_gym

    staff_profile = (
        StaffProfile.objects
        .select_related("gym")
        .filter(user=user, is_active=True)
        .first()
    )

    if staff_profile:
        return staff_profile.gym

    raise NotFound("No active gym is associated with this user.")


def get_user_role(user):
    if Gym.objects.filter(owner=user).exists():
        return "owner"

    staff_profile = StaffProfile.objects.filter(
        user=user,
        is_active=True,
    ).first()

    if staff_profile:
        return staff_profile.role

    return None