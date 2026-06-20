from django.db import models

class MilkRate(models.Model):
    MILK_TYPE_CHOICES = [
        ('COW', 'Cow'),
        ('BUFFALO', 'Buffalo'),
    ]

    milk_type = models.CharField(max_length=10, choices=MILK_TYPE_CHOICES)
    purchase_rate = models.DecimalField(max_digits=10, decimal_places=2)
    selling_rate = models.DecimalField(max_digits=10, decimal_places=2)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'milk_rates'
        indexes = [
            models.Index(fields=['milk_type']),
            models.Index(fields=['effective_from']),
        ]

    def __str__(self):
        return f"{self.get_milk_type_display()} Rate - {self.effective_from}"

class DairySettings(models.Model):
    dairy_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=255)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dairy_settings'

    def __str__(self):
        return self.dairy_name

class SystemSettings(models.Model):
    setting_key = models.CharField(max_length=255, unique=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'system_settings'

    def __str__(self):
        return self.setting_key
