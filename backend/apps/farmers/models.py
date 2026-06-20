from django.db import models
from django.utils import timezone
from django.conf import settings

class Farmer(models.Model):
    name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=20, blank=True, null=True)
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft Delete Fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='deleted_farmers')

    class Meta:
        db_table = 'farmers'

    def __str__(self):
        return f"{self.name} ({self.mobile_number})"

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()

class FarmerAuditLog(models.Model):
    ACTION_CHOICES = [
        ('DELETED', 'Deleted'),
        ('RESTORED', 'Restored'),
    ]
    
    farmer_id = models.IntegerField()
    farmer_name = models.CharField(max_length=255)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'farmer_audit_logs'

    def __str__(self):
        return f"{self.farmer_name} - {self.action} at {self.timestamp}"

class FarmerLedger(models.Model):
    TRANSACTION_TYPES = [
        ('COLLECTION', 'Collection'),
        ('PAYMENT', 'Payment'),
        ('ADJUSTMENT', 'Adjustment'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='ledger_entries')
    transaction_date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference_id = models.BigIntegerField(null=True, blank=True)
    debit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    running_balance = models.DecimalField(max_digits=12, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'farmer_ledger'

    def __str__(self):
        return f"{self.farmer.name} - {self.transaction_type} - {self.transaction_date}"
