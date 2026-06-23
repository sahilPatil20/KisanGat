import uuid
from django.db import models
from django.conf import settings
from apps.customers.models import Customer

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Paid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    start_date = models.DateField()
    end_date = models.DateField()
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(blank=True, null=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-issue_date', '-created_at']

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.name}"
        
    @property
    def outstanding_amount(self):
        from django.db.models import Sum
        from decimal import Decimal
        
        # Single source of truth: customer's ledger balance
        total_debits = self.customer.ledger_entries.aggregate(
            total=Sum('debit_amount'))['total'] or Decimal('0')
        total_credits = self.customer.ledger_entries.aggregate(
            total=Sum('credit_amount'))['total'] or Decimal('0')
        customer_balance = total_debits - total_credits
        
        if customer_balance <= 0:
            return Decimal('0')
        
        # Allocate the true outstanding debt to invoices newest-first.
        # Rationale: FIFO payments retire oldest invoices first, so any 
        # remaining unpaid debt belongs to the most recent invoices.
        all_invoices = list(Invoice.objects.filter(
            customer=self.customer
        ).order_by('-created_at').values_list('pk', 'total_amount'))
        
        remaining_debt = customer_balance
        
        for inv_pk, inv_amount in all_invoices:
            allocated_debt = min(remaining_debt, inv_amount)
            if inv_pk == self.pk:
                return allocated_debt
            remaining_debt = max(Decimal('0'), remaining_debt - allocated_debt)
        
        return Decimal('0')

    @property
    def status(self):
        outstanding = self.outstanding_amount
        if outstanding >= self.total_amount and self.total_amount > 0:
            return 'UNPAID'
        elif outstanding > 0:
            return 'PARTIAL'
        else:
            return 'PAID'

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)
