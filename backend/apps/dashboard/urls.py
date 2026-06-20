from django.urls import path
from .views import DashboardSummaryView, DashboardRevenueView, DashboardInventoryView

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('revenue/', DashboardRevenueView.as_view(), name='dashboard_revenue'),
    path('inventory/', DashboardInventoryView.as_view(), name='dashboard_inventory'),
]
