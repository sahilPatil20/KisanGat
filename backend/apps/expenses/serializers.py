from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'date', 'category', 'category_display', 'amount', 'payment_method', 'remarks', 'created_at', 'recorded_by', 'recorded_by_name']
        read_only_fields = ['id', 'created_at', 'recorded_by']
