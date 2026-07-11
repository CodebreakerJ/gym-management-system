from rest_framework.permissions import BasePermission, SAFE_METHODS

from core.utils.helpers import get_user_role


class IsGymOwner(BasePermission):
    """
    Only the gym owner can access the API.
    """

    message = "Only the gym owner can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return get_user_role(request.user) == "owner"


class IsOwnerOrReceptionist(BasePermission):
    """
    Owner and receptionist can access the API.
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)
        return role in ("owner", "receptionist")


class IsOwnerOrReadOnly(BasePermission):
    """
    Owner can modify data.
    Other authenticated gym staff can only read.
    """

    message = "Only the gym owner can modify this data."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return get_user_role(request.user) is not None

        return get_user_role(request.user) == "owner"