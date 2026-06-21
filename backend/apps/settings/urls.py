from django.urls import path
from .views import ActiveRatesAPIView, SettingsAPIView

urlpatterns = [
    path('', SettingsAPIView.as_view(), name='settings'),
    path('active-rates/', ActiveRatesAPIView.as_view(), name='active_rates'),
]
