from rest_framework import viewsets, status
from apps.authentication.permissions import IsAuthenticatedStaffOrReadOnly as IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Farmer, FarmerLedger, FarmerAuditLog
from .serializers import FarmerSerializer, FarmerLedgerSerializer
from django.utils import timezone

class FarmerViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return farmers that are not soft-deleted
        return Farmer.objects.filter(is_deleted=False).order_by('-created_at')

    @action(detail=True, methods=['get'])
    def ledger(self, request, pk=None):
        farmer = self.get_object()
        ledger_entries = farmer.ledger_entries.all().order_by('-transaction_date', '-id')
        serializer = FarmerLedgerSerializer(ledger_entries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def dependencies(self, request, pk=None):
        farmer = self.get_object()
        ledger_count = farmer.ledger_entries.count()
        # You can add more checks here later (e.g. crop records, etc)
        can_delete = ledger_count == 0
        
        return Response({
            'can_delete': can_delete,
            'dependencies': {
                'ledger_entries': ledger_count,
            }
        })

    def destroy(self, request, *args, **kwargs):
        farmer = self.get_object()
        
        # Check dependencies before soft delete
        if farmer.ledger_entries.count() > 0:
            return Response(
                {"detail": "Cannot delete farmer with existing ledger entries."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Soft Delete
        farmer.soft_delete(user=request.user)
        
        # Audit Log
        FarmerAuditLog.objects.create(
            farmer_id=farmer.id,
            farmer_name=farmer.name,
            action='DELETED',
            performed_by=request.user,
            reason="Deleted from Admin UI"
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        # We need to get the object even if it's deleted, so we override the queryset
        farmer = Farmer.objects.get(pk=pk)
        
        if not farmer.is_deleted:
            return Response({"detail": "Farmer is not deleted."}, status=status.HTTP_400_BAD_REQUEST)
            
        farmer.restore()
        
        # Audit Log
        FarmerAuditLog.objects.create(
            farmer_id=farmer.id,
            farmer_name=farmer.name,
            action='RESTORED',
            performed_by=request.user,
            reason="Restored from Admin UI"
        )
        
        return Response(status=status.HTTP_200_OK)
