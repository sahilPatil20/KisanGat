from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/farmers/', include('apps.farmers.urls')),
    path('api/v1/collections/', include('apps.collections.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/customers/', include('apps.customers.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/employees/', include('apps.employees.urls')),
    path('api/v1/expenses/', include('apps.expenses.urls')),
    path('api/v1/billing/', include('apps.billing.urls')),
]
