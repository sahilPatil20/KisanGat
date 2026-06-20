from django.db import models
from django.conf import settings

class Employee(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=100)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, help_text="Monthly Base Salary")
    join_date = models.DateField()
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employees'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.role}"

class EmployeeAttendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_attendance'
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.status}"

class EmployeeSalaryRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_records')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50, default='CASH')
    remarks = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_salary_records'
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.employee.name} - {self.amount_paid} on {self.payment_date}"
