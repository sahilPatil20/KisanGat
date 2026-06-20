from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import FarmerViewSet

router = SimpleRouter()
router.register(r'', FarmerViewSet, basename='farmer')

urlpatterns = [
    path('', include(router.urls)),
]
