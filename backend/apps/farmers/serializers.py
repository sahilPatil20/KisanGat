from rest_framework import serializers
from .models import Farmer, FarmerLedger

class FarmerLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerLedger
        fields = '__all__'

class FarmerSerializer(serializers.ModelSerializer):
    # Calculate current balance from the latest ledger entry or default to 0
    current_balance = serializers.SerializerMethodField()

    class Meta:
        model = Farmer
        fields = ['id', 'name', 'mobile_number', 'address', 'bank_account_number', 'bank_ifsc', 'upi_id', 'created_at', 'current_balance']
        read_only_fields = ['id', 'created_at']

    def get_current_balance(self, obj):
        latest_ledger = obj.ledger_entries.order_by('-transaction_date', '-id').first()
        if latest_ledger:
            return str(latest_ledger.running_balance)
        return "0.00"
