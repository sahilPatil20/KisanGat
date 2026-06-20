from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MilkCollectionViewSet

router = SimpleRouter()
router.register(r'', MilkCollectionViewSet, basename='collection')

urlpatterns = [
    path('', include(router.urls)),
]
