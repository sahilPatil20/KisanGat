from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F
from decimal import Decimal
from .models import FarmerPayment
from .serializers import FarmerPaymentSerializer
from apps.farmers.models import Farmer, FarmerLedger
from apps.collections.models import MilkCollection
from django.db.models import Sum

class FarmerPaymentViewSet(viewsets.ModelViewSet):
    queryset = FarmerPayment.objects.all().order_by('-created_at')
    serializer_class = FarmerPaymentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='pending-dues')
    def pending_dues(self, request):
        """Fetch all farmers whose latest ledger entry has a positive running balance (we owe them money)."""
        farmers = Farmer.objects.all()
        pending = []
        for farmer in farmers:
            latest = farmer.ledger_entries.order_by('-transaction_date', '-id').first()
            if latest and latest.running_balance > Decimal('0.00'):
                pending.append({
                    "farmer_id": farmer.id,
                    "farmer_name": farmer.name,
                    "phone": farmer.mobile_number,
                    "due_amount": latest.running_balance
                })
        return Response(pending, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='farmer-summary')
    def farmer_summary(self, request):
        farmer_id = request.query_params.get('farmer_id')
        if not farmer_id:
            return Response({"detail": "farmer_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            farmer = Farmer.objects.get(id=farmer_id)
        except Farmer.DoesNotExist:
            return Response({"detail": "Farmer not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Get latest ledger
        latest_ledger = farmer.ledger_entries.order_by('-transaction_date', '-id').first()
        pending_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')
        
        # Calculate other summaries
        collections = MilkCollection.objects.filter(farmer=farmer)
        total_liters = collections.aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        total_earned = collections.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        payments = FarmerPayment.objects.filter(farmer=farmer)
        total_paid = payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        return Response({
            "farmer_name": farmer.name,
            "total_liters": float(total_liters),
            "gross_amount": float(total_earned),
            "already_paid": float(total_paid),
            "pending_balance": float(pending_balance)
        })

    @action(detail=False, methods=['post'], url_path='bulk-settle')
    def bulk_settle(self, request):
        """Processes an array of farmer IDs and settles their full outstanding balance."""
        farmer_ids = request.data.get('farmer_ids', [])
        payment_method = request.data.get('payment_method', 'CASH')
        remarks = request.data.get('remarks', 'Automated Bulk Settlement')

        if not farmer_ids:
            return Response({"detail": "No farmers selected for settlement."}, status=status.HTTP_400_BAD_REQUEST)

        settled_count = 0
        total_settled_amount = Decimal('0.00')

        with transaction.atomic():
            for f_id in farmer_ids:
                try:
                    farmer = Farmer.objects.get(id=f_id)
                except Farmer.DoesNotExist:
                    continue

                latest_ledger = farmer.ledger_entries.order_by('-transaction_date', '-id').first()
                if not latest_ledger or latest_ledger.running_balance <= Decimal('0.00'):
                    continue # Nothing to settle

                due_amount = latest_ledger.running_balance

                # 1. Create Payment Record
                payment = FarmerPayment.objects.create(
                    farmer=farmer,
                    amount=due_amount,
                    payment_method=payment_method,
                    remarks=remarks,
                    processed_by=request.user
                )

                # 2. Update Ledger (Running Balance becomes 0)
                FarmerLedger.objects.create(
                    farmer=farmer,
                    transaction_type='PAYMENT',
                    reference_id=payment.id,
                    debit_amount=due_amount,
                    running_balance=Decimal('0.00'),
                    remarks=f"Bulk Settlement via {payment.get_payment_method_display()}"
                )

                settled_count += 1
                total_settled_amount += due_amount

        return Response({
            "detail": f"Successfully settled {settled_count} farmers.",
            "total_settled_amount": total_settled_amount
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        with transaction.atomic():
            payment = serializer.save(processed_by=self.request.user)
            
            # --- Ledger Integration ---
            farmer = payment.farmer
            latest_ledger = farmer.ledger_entries.order_by('-transaction_date', '-id').first()
            previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')

            # Payment is a debit (reduces the amount we owe to the farmer)
            amount = Decimal(str(payment.amount))
            new_balance = previous_balance - amount

            remarks = f"Payment via {payment.get_payment_method_display()}"
            if payment.reference_number:
                remarks += f" (Ref: {payment.reference_number})"

            FarmerLedger.objects.create(
                farmer=farmer,
                transaction_type='PAYMENT',
                reference_id=payment.id,
                debit_amount=amount,
                running_balance=new_balance,
                remarks=remarks
            )

    def destroy(self, request, *args, **kwargs):
        # Payments should not be deleted to preserve ledger integrity
        return Response(
            {"detail": "Payments cannot be deleted once added. Please add an adjustment entry if needed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Payments cannot be modified once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
