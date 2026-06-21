from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
from .models import MilkSale
from .serializers import MilkSaleSerializer
from apps.collections.models import MilkCollection
from apps.customers.models import Customer, CustomerLedger, CustomerPayment

class MilkSaleViewSet(viewsets.ModelViewSet):
    queryset = MilkSale.objects.all().order_by('-created_at')
    serializer_class = MilkSaleSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='inventory-status')
    def inventory_status(self, request):
        total_collections = MilkCollection.objects.aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        total_sales = MilkSale.objects.aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        available = total_collections - total_sales
        return Response({"available_inventory": available})

    @action(detail=False, methods=['get'], url_path='customer-summary')
    def customer_summary(self, request):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"detail": "customer_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({"detail": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
            
        latest_ledger = customer.ledger_entries.order_by('-transaction_date', '-id').first()
        outstanding_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')
        
        return Response({
            "customer_name": customer.name,
            "outstanding_balance": float(outstanding_balance)
        })

    def perform_create(self, serializer):
        with transaction.atomic():
            quantity = Decimal(str(serializer.validated_data['quantity']))
            applied_rate = Decimal(str(serializer.validated_data['applied_rate']))
            total_amount = quantity * applied_rate
            paid_amount = serializer.validated_data.pop('paid_amount', Decimal('0.00'))

            sale = serializer.save(total_amount=total_amount)
            
            # --- Ledger Integration (Sale Debit) ---
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
                remarks=f"{sale.get_shift_display()} Shift - {sale.get_milk_type_display()} Milk: {quantity}L"
            )

            # --- Handle Payment if provided ---
            if paid_amount > Decimal('0.00'):
                payment = CustomerPayment.objects.create(
                    customer=customer,
                    amount=paid_amount,
                    payment_method='CASH', # Default to cash for inline sales payments
                    remarks=f"Payment received during sale #{sale.id}"
                )
                
                new_balance_after_payment = new_balance - paid_amount
                CustomerLedger.objects.create(
                    customer=customer,
                    transaction_type='PAYMENT',
                    reference_id=payment.id,
                    credit_amount=paid_amount,
                    running_balance=new_balance_after_payment,
                    remarks=f"Payment for sale #{sale.id}"
                )

            # --- Inventory Integration ---
            from apps.inventory.models import InventoryTransaction
            # If the milk_type is MIXED, we still log it for auditing, but the dashboard logic 
            # will need to handle how MIXED affects COW/BUFFALO separately, or we just deduct it from TOTAL.
            InventoryTransaction.objects.create(
                transaction_type='SALE',
                milk_type=sale.milk_type,
                quantity=quantity,
                reference_id=sale.id,
                remarks=f"Sale to {customer.name} (Shift: {sale.get_shift_display()})"
            )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Sales records cannot be deleted to preserve ledger integrity."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Sales records cannot be modified once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
