from rest_framework import serializers
from .models import FarmerPayment

class FarmerPaymentSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)
    farmer_mobile = serializers.CharField(source='farmer.mobile_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.username', read_only=True)

    class Meta:
        model = FarmerPayment
        fields = [
            'id', 'farmer', 'farmer_name', 'farmer_mobile', 'payment_date', 
            'amount', 'payment_method', 'reference_number', 'remarks', 
            'created_at', 'processed_by', 'processed_by_name'
        ]
        read_only_fields = ['id', 'payment_date', 'created_at', 'processed_by']
