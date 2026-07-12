from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import ( TokenRefreshView )
from core.views.auth_views import (
    GymTokenObtainPairView,
)


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/login/",
        GymTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path("api/", include("core.urls")),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )