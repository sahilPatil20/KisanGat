from django.db import models
from django.utils import timezone
from django.conf import settings

class Customer(models.Model):
    CUSTOMER_TYPES = [
        ('RETAIL', 'Retail'),
        ('WHOLESALE', 'Wholesale'),
        ('HOTEL', 'Hotel'),
        ('SHOP', 'Shop'),
    ]

    name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default='RETAIL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft Delete Fields
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='deleted_customers')

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return f"{self.name} ({self.get_customer_type_display()})"
        
    @property
    def outstanding_balance(self):
        from django.db.models import Sum
        debits = self.ledger_entries.aggregate(total=Sum('debit_amount'))['total'] or 0
        credits = self.ledger_entries.aggregate(total=Sum('credit_amount'))['total'] or 0
        return debits - credits

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


class CustomerAuditLog(models.Model):
    ACTION_CHOICES = [
        ('DELETED', 'Deleted'),
        ('RESTORED', 'Restored'),
    ]
    
    customer_id = models.IntegerField()
    customer_name = models.CharField(max_length=255)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'customer_audit_logs'

    def __str__(self):
        return f"{self.customer_name} - {self.action} at {self.timestamp}"


class CustomerLedger(models.Model):
    TRANSACTION_TYPES = [
        ('SALE', 'Sale'),
        ('PAYMENT', 'Payment'),
        ('ADJUSTMENT', 'Adjustment'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='ledger_entries')
    transaction_date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference_id = models.BigIntegerField(null=True, blank=True)
    debit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    running_balance = models.DecimalField(max_digits=12, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'customer_ledger'

    def __str__(self):
        return f"{self.customer.name} - {self.transaction_type} - {self.transaction_date}"


class CustomerPayment(models.Model):
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('UPI', 'UPI'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'customer_payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.amount} - {self.payment_date}"
