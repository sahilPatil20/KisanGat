from django.db import models
from django.conf import settings
from apps.farmers.models import Farmer

class FarmerPayment(models.Model):
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('UPI', 'UPI'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'farmer_payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.farmer.name} - {self.amount} - {self.payment_date}"
