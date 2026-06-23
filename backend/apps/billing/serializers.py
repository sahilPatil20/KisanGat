from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.mobile_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name', 'customer_phone',
            'start_date', 'end_date', 'issue_date', 'due_date',
            'total_amount', 'outstanding_amount', 'status',
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'invoice_number', 'issue_date', 'created_at', 'created_by']

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after the start date.'
            })
        return data
