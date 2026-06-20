from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet

router = DefaultRouter()
router.register(r'adjustments', InventoryViewSet, basename='inventory')

urlpatterns = [
    path('dashboard/', InventoryViewSet.as_view({'get': 'dashboard'}), name='inventory-dashboard'),
    path('history/', InventoryViewSet.as_view({'get': 'history'}), name='inventory-history'),
    path('', include(router.urls)),
]
