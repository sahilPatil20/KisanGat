from django.db import models
from django.conf import settings

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('FUEL', 'Fuel'),
        ('UTILITIES', 'Utilities (Electricity/Water)'),
        ('MAINTENANCE', 'Equipment Maintenance'),
        ('TRANSPORT', 'Transport/Logistics'),
        ('OFFICE', 'Office Supplies'),
        ('MISC', 'Miscellaneous'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('UPI', 'UPI'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHEQUE', 'Cheque'),
    ]

    date = models.DateField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.category} - {self.amount} on {self.date}"
