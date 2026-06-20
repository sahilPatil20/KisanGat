from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
from .models import Product, ProductInventoryTransaction, ProductSale
from .serializers import ProductSerializer, ProductInventoryTransactionSerializer, ProductSaleSerializer
from apps.customers.models import CustomerLedger, CustomerPayment

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='inventory-dashboard')
    def inventory_dashboard(self, request):
        products = Product.objects.filter(is_active=True)
        dashboard_data = []

        for product in products:
            qs = ProductInventoryTransaction.objects.filter(product=product)
            additions = qs.filter(transaction_type__in=['ADDITION', 'ADJUSTMENT']).aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            sales = qs.filter(transaction_type='SALE').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            spoilage = qs.filter(transaction_type='SPOILAGE').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            
            # Since ADJUSTMENT could be negative, we probably want ADDITION vs SUBTRACTION, but let's assume ADDITION is stock in.
            # If adjustments are negative, they should be a separate type or we handle it gracefully.
            # To keep it simple, let's just sum all additions and subtract sales/spoilage.
            
            # Let's refine based on transaction_type.
            # Actually, let's just sum all of them if we treat transaction_type carefully.
            additions = qs.filter(transaction_type='ADDITION').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            adjustments = qs.filter(transaction_type='ADJUSTMENT').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            
            current_stock = additions + adjustments - sales - spoilage
            
            dashboard_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "unit": product.unit_of_measure,
                "current_stock": current_stock,
                "total_additions": additions,
                "total_sales": sales,
                "total_spoilage": spoilage
            })
        return Response(dashboard_data)

class ProductInventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = ProductInventoryTransaction.objects.all().order_by('-created_at')
    serializer_class = ProductInventoryTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete inventory logs."}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Cannot modify inventory logs."}, status=status.HTTP_400_BAD_REQUEST)

class ProductSaleViewSet(viewsets.ModelViewSet):
    queryset = ProductSale.objects.all().order_by('-created_at')
    serializer_class = ProductSaleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        with transaction.atomic():
            quantity = Decimal(str(serializer.validated_data['quantity']))
            unit_price = Decimal(str(serializer.validated_data['unit_price']))
            total_amount = quantity * unit_price
            paid_amount = serializer.validated_data.pop('paid_amount', Decimal('0.00'))

            sale = serializer.save(total_amount=total_amount, recorded_by=self.request.user)
            
            # 1. Update Product Inventory
            ProductInventoryTransaction.objects.create(
                product=sale.product,
                transaction_type='SALE',
                quantity=quantity,
                reference_id=sale.id,
                remarks=f"Sold to {sale.customer.name}",
                created_by=self.request.user
            )

            # 2. Ledger Integration (Sale Debit)
            customer = sale.customer
            latest_ledger = customer.ledger_entries.order_by('-transaction_date', '-id').first()
            previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')

            new_balance = previous_balance + total_amount

            CustomerLedger.objects.create(
                customer=customer,
                transaction_type='SALE',
                reference_id=sale.id,
                debit_amount=total_amount,
                running_balance=new_balance,
                remarks=f"Product Sale: {sale.product.name} ({quantity} {sale.product.unit_of_measure})"
            )

            # 3. Handle Payment if provided
            if paid_amount > Decimal('0.00'):
                payment = CustomerPayment.objects.create(
                    customer=customer,
                    amount=paid_amount,
                    payment_method='CASH',
                    remarks=f"Payment received during product sale #{sale.id}"
                )
                
                new_balance_after_payment = new_balance - paid_amount
                CustomerLedger.objects.create(
                    customer=customer,
                    transaction_type='PAYMENT',
                    reference_id=payment.id,
                    credit_amount=paid_amount,
                    running_balance=new_balance_after_payment,
                    remarks=f"Payment for product sale #{sale.id}"
                )

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete product sales."}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Cannot modify product sales."}, status=status.HTTP_400_BAD_REQUEST)
