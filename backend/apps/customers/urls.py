from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CustomerViewSet, CustomerPaymentViewSet

router = SimpleRouter()
router.register(r'payments', CustomerPaymentViewSet, basename='customer-payment')
router.register(r'', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
]
