from rest_framework import viewsets, status
from rest_framework.decorators import action
from apps.authentication.permissions import IsAuthenticatedStaffOrReadOnly as IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from .models import InventoryAdjustment, InventoryTransaction
from .serializers import InventoryAdjustmentSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryAdjustment.objects.all().order_by('-created_at')
    serializer_class = InventoryAdjustmentSerializer
    permission_classes = [IsAuthenticated]

    def _get_inventory_stock(self, date=None, milk_type=None):
        """Helper to calculate accurate stock from transactions"""
        qs = InventoryTransaction.objects.all()
        if date:
            qs = qs.filter(date__lte=date)
        if milk_type:
            qs = qs.filter(milk_type=milk_type)

        additions = qs.filter(transaction_type__in=['COLLECTION', 'ADJUSTMENT_ADD']).aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        deductions = qs.filter(transaction_type__in=['SALE', 'ADJUSTMENT_SUBTRACT']).aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        
        return additions - deductions

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now().date()
        
        # Calculate current stock
        cow_stock = self._get_inventory_stock(milk_type='COW')
        buffalo_stock = self._get_inventory_stock(milk_type='BUFFALO')
        mixed_stock = self._get_inventory_stock(milk_type='MIXED') # Just in case sales logged as MIXED
        total_stock = cow_stock + buffalo_stock + mixed_stock

        # Today's metrics
        today_tx = InventoryTransaction.objects.filter(date=today)
        
        today_collections = today_tx.filter(transaction_type='COLLECTION').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        today_sales = today_tx.filter(transaction_type='SALE').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        
        today_adj_add = today_tx.filter(transaction_type='ADJUSTMENT_ADD').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        today_adj_sub = today_tx.filter(transaction_type='ADJUSTMENT_SUBTRACT').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        today_adjustments = today_adj_add - today_adj_sub

        return Response({
            "current_stock": {
                "cow": cow_stock,
                "buffalo": buffalo_stock,
                "total": total_stock
            },
            "today_collection": today_collections,
            "today_sales": today_sales,
            "today_adjustments": today_adjustments,
            "closing_stock": total_stock
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        # We need a day-by-day aggregation
        # For simplicity in this endpoint, we'll return the last 30 days of activity
        from datetime import timedelta
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        history = []
        current_date = start_date
        
        # Calculate opening stock before start_date
        running_stock = self._get_inventory_stock(date=start_date - timedelta(days=1))
        
        while current_date <= end_date:
            daily_tx = InventoryTransaction.objects.filter(date=current_date)
            
            collections = daily_tx.filter(transaction_type='COLLECTION').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            sales = daily_tx.filter(transaction_type='SALE').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            
            adj_add = daily_tx.filter(transaction_type='ADJUSTMENT_ADD').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            adj_sub = daily_tx.filter(transaction_type='ADJUSTMENT_SUBTRACT').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
            net_adjustments = adj_add - adj_sub
            
            closing_stock = running_stock + collections - sales + net_adjustments
            
            # Only include days with activity or current day
            if collections > 0 or sales > 0 or net_adjustments != 0 or current_date == end_date:
                history.append({
                    "date": current_date,
                    "opening_stock": running_stock,
                    "collection": collections,
                    "sales": sales,
                    "adjustments": net_adjustments,
                    "closing_stock": closing_stock
                })
                
            running_stock = closing_stock
            current_date += timedelta(days=1)
            
        return Response(history[::-1]) # Return newest first

    def perform_create(self, serializer):
        with transaction.atomic():
            adj_type = serializer.validated_data['adjustment_type']
            milk_type = serializer.validated_data['milk_type']
            quantity = Decimal(str(serializer.validated_data['quantity']))
            
            # Validate Negative Inventory
            if adj_type == 'SUBTRACT':
                current_stock = self._get_inventory_stock(milk_type=milk_type)
                if quantity > current_stock:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({
                        "detail": f"Adjustment quantity ({quantity}L) exceeds available inventory for {milk_type} ({current_stock}L)."
                    })

            adjustment = serializer.save(created_by=self.request.user)
            
            # Create Transaction Log
            InventoryTransaction.objects.create(
                transaction_type=f'ADJUSTMENT_{adj_type}',
                milk_type=adjustment.milk_type,
                quantity=adjustment.quantity,
                reference_id=adjustment.id,
                remarks=f"{adjustment.get_reason_display()} - {adjustment.remarks or 'No remarks'}"
            )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Inventory adjustments cannot be deleted to preserve audit logs. Please create a reverse adjustment."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Inventory adjustments cannot be modified once added."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
