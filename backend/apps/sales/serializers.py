from rest_framework import serializers
from .models import MilkSale

class MilkSaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_mobile = serializers.CharField(source='customer.mobile_number', read_only=True)
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2, write_only=True, required=False)

    class Meta:
        model = MilkSale
        fields = [
            'id', 'sale_date', 'shift', 'customer', 'customer_name', 'customer_mobile',
            'milk_type', 'quantity', 'applied_rate', 'total_amount', 
            'payment_status', 'remarks', 'paid_amount', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'total_amount']
