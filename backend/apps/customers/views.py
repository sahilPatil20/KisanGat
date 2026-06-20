from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from .models import Customer, CustomerLedger, CustomerAuditLog, CustomerPayment
from .serializers import CustomerSerializer, CustomerLedgerSerializer, CustomerPaymentSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Customer.objects.filter(is_deleted=False).order_by('-created_at')

    @action(detail=True, methods=['get'])
    def ledger(self, request, pk=None):
        customer = self.get_object()
        ledger_entries = customer.ledger_entries.all().order_by('-transaction_date', '-id')
        serializer = CustomerLedgerSerializer(ledger_entries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='record-payment')
    def record_payment(self, request, pk=None):
        customer = self.get_object()
        serializer = CustomerPaymentSerializer(data={**request.data, 'customer': customer.id})
        
        if serializer.is_valid():
            with transaction.atomic():
                payment = serializer.save(processed_by=request.user)
                
                latest_ledger = customer.ledger_entries.order_by('-transaction_date', '-id').first()
                previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')

                amount = Decimal(str(payment.amount))
                new_balance = previous_balance - amount

                remarks = f"Payment Received via {payment.get_payment_method_display()}"
                if payment.reference_number:
                    remarks += f" (Ref: {payment.reference_number})"

                CustomerLedger.objects.create(
                    customer=customer,
                    transaction_type='PAYMENT',
                    reference_id=payment.id,
                    credit_amount=amount,
                    running_balance=new_balance,
                    remarks=remarks
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        customer = self.get_object()
        if customer.ledger_entries.count() > 0:
            return Response(
                {"detail": "Cannot delete customer with existing ledger entries."},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer.soft_delete(user=request.user)
        CustomerAuditLog.objects.create(
            customer_id=customer.id,
            customer_name=customer.name,
            action='DELETED',
            performed_by=request.user,
            reason="Deleted from Admin UI"
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

class CustomerPaymentViewSet(viewsets.ModelViewSet):
    queryset = CustomerPayment.objects.all().order_by('-created_at')
    serializer_class = CustomerPaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        with transaction.atomic():
            payment = serializer.save(processed_by=self.request.user)
            
            customer = payment.customer
            latest_ledger = customer.ledger_entries.order_by('-transaction_date', '-id').first()
            previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')

            # Payment from customer reduces their owed balance (Credit)
            amount = Decimal(str(payment.amount))
            new_balance = previous_balance - amount

            remarks = f"Payment Received via {payment.get_payment_method_display()}"
            if payment.reference_number:
                remarks += f" (Ref: {payment.reference_number})"

            CustomerLedger.objects.create(
                customer=customer,
                transaction_type='PAYMENT',
                reference_id=payment.id,
                credit_amount=amount,
                running_balance=new_balance,
                remarks=remarks
            )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Payments cannot be deleted once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Payments cannot be modified once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
