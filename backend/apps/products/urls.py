from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductInventoryTransactionViewSet, ProductSaleViewSet

router = DefaultRouter()
router.register(r'catalog', ProductViewSet, basename='product')
router.register(r'inventory', ProductInventoryTransactionViewSet, basename='product-inventory')
router.register(r'sales', ProductSaleViewSet, basename='product-sale')

urlpatterns = [
    path('', include(router.urls)),
]
