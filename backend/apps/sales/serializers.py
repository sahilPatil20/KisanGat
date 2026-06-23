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

    def validate(self, data):
        quantity = data['quantity']
        applied_rate = data['applied_rate']
        paid_amount = data.get('paid_amount', 0)
        total_amount = quantity * applied_rate

        errors = {}
        if quantity <= 0:
            errors['quantity'] = 'Quantity must be greater than zero.'
        if applied_rate <= 0:
            errors['applied_rate'] = 'Applied rate must be greater than zero.'
        if paid_amount < 0:
            errors['paid_amount'] = 'Paid amount cannot be negative.'
        elif paid_amount > total_amount:
            errors['paid_amount'] = 'Paid amount cannot exceed the sale total.'
        if errors:
            raise serializers.ValidationError(errors)
        return data
