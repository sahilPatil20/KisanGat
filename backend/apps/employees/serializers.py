from rest_framework import serializers
from .models import Employee, EmployeeAttendance, EmployeeSalaryRecord

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = EmployeeAttendance
        fields = ['id', 'employee', 'employee_name', 'date', 'status', 'remarks', 'recorded_by', 'recorded_by_name', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']

class EmployeeSalaryRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = EmployeeSalaryRecord
        fields = ['id', 'employee', 'employee_name', 'amount_paid', 'payment_date', 'payment_method', 'remarks', 'recorded_by', 'recorded_by_name', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']
