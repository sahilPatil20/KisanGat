from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MilkSaleViewSet

router = SimpleRouter()
router.register(r'', MilkSaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]
