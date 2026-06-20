from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import FarmerPaymentViewSet

router = SimpleRouter()
router.register(r'', FarmerPaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
