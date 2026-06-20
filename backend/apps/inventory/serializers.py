from rest_framework import serializers
from .models import InventoryAdjustment, InventoryTransaction

class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = InventoryAdjustment
        fields = [
            'id', 'date', 'milk_type', 'adjustment_type', 'quantity', 
            'reason', 'remarks', 'reference_number', 'created_by', 
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = '__all__'
