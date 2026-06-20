from rest_framework import serializers
from .models import MilkCollection

class MilkCollectionSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)
    farmer_mobile = serializers.CharField(source='farmer.mobile_number', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = MilkCollection
        fields = [
            'id', 'collection_date', 'shift', 'farmer', 'farmer_name', 'farmer_mobile',
            'milk_type', 'quantity', 'fat_percentage', 'snf_percentage', 
            'applied_rate', 'total_amount', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'total_amount']

    def validate(self, data):
        # We can add custom validation logic here if needed
        # e.g., ensure future dates are not allowed
        return data
