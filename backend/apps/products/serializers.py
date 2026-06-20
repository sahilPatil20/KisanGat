from rest_framework import serializers
from .models import Product, ProductInventoryTransaction, ProductSale

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductInventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = ProductInventoryTransaction
        fields = [
            'id', 'product', 'product_name', 'transaction_type', 
            'quantity', 'date', 'reference_id', 'remarks', 
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

class ProductSaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model = ProductSale
        fields = [
            'id', 'customer', 'customer_name', 'product', 'product_name',
            'quantity', 'unit_price', 'total_amount', 'paid_amount',
            'sale_date', 'remarks', 'created_at', 'recorded_by', 'recorded_by_name'
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'recorded_by']
