from django.db import models
from apps.customers.models import Customer
from apps.settings.models import MilkRate

class MilkSale(models.Model):
    MILK_TYPE_CHOICES = [
        ('COW', 'Cow'),
        ('BUFFALO', 'Buffalo'),
        ('MIXED', 'Mixed'),
    ]
    SHIFT_CHOICES = [
        ('MORNING', 'Morning'),
        ('EVENING', 'Evening'),
    ]

    sale_date = models.DateField()
    shift = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='MORNING')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='milk_sales')
    milk_type = models.CharField(max_length=10, choices=MILK_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Snapshot of the rate at the time of sale
    rate_id = models.ForeignKey(MilkRate, on_delete=models.SET_NULL, null=True, blank=True)
    applied_rate = models.DecimalField(max_digits=10, decimal_places=2)
    
    PAYMENT_STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partial'),
        ('DUE', 'Due'),
    ]

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='DUE')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'milk_sales'

    def __str__(self):
        return f"{self.customer.name} - {self.sale_date} - {self.get_shift_display()} - {self.quantity}L"
