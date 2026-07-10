from core.models import Gym


def get_user_gym(user):
    return Gym.objects.get(owner=user)