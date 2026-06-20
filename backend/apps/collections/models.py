from django.db import models
from apps.farmers.models import Farmer
from apps.settings.models import MilkRate

class MilkCollection(models.Model):
    MILK_TYPE_CHOICES = [
        ('COW', 'Cow'),
        ('BUFFALO', 'Buffalo'),
    ]
    SHIFT_CHOICES = [
        ('MORNING', 'Morning'),
        ('EVENING', 'Evening'),
    ]

    collection_date = models.DateField()
    shift = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='MORNING')
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='milk_collections')
    milk_type = models.CharField(max_length=10, choices=MILK_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    fat_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    snf_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Snapshot of the rate at the time of collection
    rate_id = models.ForeignKey(MilkRate, on_delete=models.SET_NULL, null=True, blank=True)
    applied_rate = models.DecimalField(max_digits=10, decimal_places=2)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'milk_collections'

    def __str__(self):
        return f"{self.farmer.name} - {self.collection_date} - {self.quantity}L"
