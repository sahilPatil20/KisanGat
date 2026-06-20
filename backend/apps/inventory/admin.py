from django.contrib import admin
from .models import InventoryTransaction, InventoryAdjustment

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'transaction_type', 'milk_type', 'quantity', 'created_at')
    list_filter = ('transaction_type', 'milk_type', 'date')
    search_fields = ('reference_id', 'remarks')

@admin.register(InventoryAdjustment)
class InventoryAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('date', 'adjustment_type', 'milk_type', 'quantity', 'reason', 'created_by')
    list_filter = ('adjustment_type', 'milk_type', 'reason', 'date')
    search_fields = ('remarks', 'reference_number')
