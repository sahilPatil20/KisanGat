from django.db import models
from django.conf import settings
from apps.customers.models import Customer

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    unit_of_measure = models.CharField(max_length=50) # e.g., kg, packet, liter
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'products'
        ordering = ['name']

    def __str__(self):
        return self.name

class ProductInventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('ADDITION', 'Addition (Stock In)'),
        ('SALE', 'Sale (Stock Out)'),
        ('SPOILAGE', 'Spoilage (Stock Out)'),
        ('ADJUSTMENT', 'Manual Adjustment'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    reference_id = models.BigIntegerField(null=True, blank=True) # Sale ID or Adjustment ID
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'product_inventory_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.transaction_type} - {self.quantity}"

class ProductSale(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='product_sales')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    sale_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'product_sales'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.product.name} - {self.total_amount}"
