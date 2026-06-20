from django.db import models
from django.contrib.auth.models import User
import uuid

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('COLLECTION', 'Collection'),
        ('SALE', 'Sale'),
        ('ADJUSTMENT_ADD', 'Adjustment Add'),
        ('ADJUSTMENT_SUBTRACT', 'Adjustment Subtract'),
    ]

    MILK_TYPES = [
        ('COW', 'Cow'),
        ('BUFFALO', 'Buffalo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    milk_type = models.CharField(max_length=10, choices=MILK_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reference_id = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.milk_type}: {self.quantity}L"


class InventoryAdjustment(models.Model):
    ADJUSTMENT_TYPES = [
        ('ADD', 'Add'),
        ('SUBTRACT', 'Subtract'),
    ]

    REASON_CHOICES = [
        ('SPOILAGE', 'Spoilage'),
        ('LEAKAGE', 'Leakage'),
        ('TESTING', 'Testing'),
        ('PERSONAL_USE', 'Personal Use'),
        ('DONATION', 'Donation'),
        ('MANUAL_CORRECTION', 'Manual Correction'),
        ('OTHER', 'Other'),
    ]

    MILK_TYPES = [
        ('COW', 'Cow'),
        ('BUFFALO', 'Buffalo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(auto_now_add=True)
    milk_type = models.CharField(max_length=10, choices=MILK_TYPES)
    adjustment_type = models.CharField(max_length=10, choices=ADJUSTMENT_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    remarks = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=50, blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='inventory_adjustments')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_adjustments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_adjustments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.adjustment_type} {self.quantity}L ({self.milk_type}) - {self.reason}"
