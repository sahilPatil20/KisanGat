from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import MilkCollection
from .serializers import MilkCollectionSerializer
from apps.farmers.models import Farmer, FarmerLedger
from decimal import Decimal

class MilkCollectionViewSet(viewsets.ModelViewSet):
    queryset = MilkCollection.objects.all().order_by('-collection_date', '-created_at')
    serializer_class = MilkCollectionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        with transaction.atomic():
            # Calculate total amount
            quantity = Decimal(str(serializer.validated_data['quantity']))
            applied_rate = Decimal(str(serializer.validated_data['applied_rate']))
            total_amount = quantity * applied_rate

            farmer = Farmer.objects.select_for_update().get(
                pk=serializer.validated_data['farmer'].pk
            )

            # Save the MilkCollection
            collection = serializer.save(farmer=farmer, total_amount=total_amount)

            # --- Ledger Integration ---
            latest_ledger = farmer.ledger_entries.order_by('-transaction_date', '-id').first()
            previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')

            # A Milk Collection means the Dairy owes the Farmer money (Credit to Farmer)
            # In our simple ledger, a positive running_balance means the Dairy owes the Farmer.
            # So we add the total_amount to the running balance.
            new_balance = previous_balance + total_amount

            FarmerLedger.objects.create(
                farmer=farmer,
                transaction_type='COLLECTION',
                reference_id=collection.id,
                credit_amount=total_amount,
                running_balance=new_balance,
                remarks=f"{collection.get_shift_display()} Shift - {collection.get_milk_type_display()} Milk: {quantity}L"
            )

            # --- Inventory Integration ---
            from apps.inventory.models import InventoryTransaction
            InventoryTransaction.objects.create(
                transaction_type='COLLECTION',
                milk_type=collection.milk_type,
                quantity=quantity,
                reference_id=collection.id,
                remarks=f"Collection from {farmer.name} (Shift: {collection.get_shift_display()})"
            )

    def destroy(self, request, *args, **kwargs):
        # Prevent deletion for MVP to keep ledger math simple, or implement full reverse-ledger later
        return Response(
            {"detail": "Collections cannot be deleted once added. Please add an adjustment entry if needed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        # Prevent updates to keep ledger math simple
        return Response(
            {"detail": "Collections cannot be modified once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
