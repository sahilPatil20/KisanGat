from rest_framework import serializers
from .models import Customer, CustomerLedger, CustomerPayment

class CustomerSerializer(serializers.ModelSerializer):
    current_balance = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'mobile_number', 'address', 'customer_type', 'current_balance', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_current_balance(self, obj):
        return obj.outstanding_balance


class CustomerLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerLedger
        fields = '__all__'


class CustomerPaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_mobile = serializers.CharField(source='customer.mobile_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.username', read_only=True)

    class Meta:
        model = CustomerPayment
        fields = [
            'id', 'customer', 'customer_name', 'customer_mobile', 'payment_date', 
            'amount', 'payment_method', 'reference_number', 'remarks', 
            'created_at', 'processed_by', 'processed_by_name'
        ]
        read_only_fields = ['id', 'payment_date', 'created_at', 'processed_by']
