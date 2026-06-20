from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, EmployeeAttendanceViewSet, EmployeeSalaryRecordViewSet

router = DefaultRouter()
router.register(r'profiles', EmployeeViewSet, basename='employee')
router.register(r'attendance', EmployeeAttendanceViewSet, basename='employee-attendance')
router.register(r'salary', EmployeeSalaryRecordViewSet, basename='employee-salary')

urlpatterns = [
    path('', include(router.urls)),
]
