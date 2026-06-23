from rest_framework import viewsets, status
from rest_framework.decorators import action
from apps.authentication.permissions import IsAuthenticatedStaffOrReadOnly as IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
import datetime
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        
        # Calculate last month start and end
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - datetime.timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        current_month_qs = Expense.objects.filter(date__gte=current_month_start, date__lte=today)
        last_month_qs = Expense.objects.filter(date__gte=last_month_start, date__lte=last_month_end)

        current_total = current_month_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        last_total = last_month_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Category breakdown for current month
        categories = current_month_qs.values('category').annotate(total=Sum('amount')).order_by('-total')
        category_breakdown = []
        for c in categories:
            # Get display name
            display_name = dict(Expense.CATEGORY_CHOICES).get(c['category'], c['category'])
            category_breakdown.append({
                "name": display_name,
                "value": float(c['total'])
            })

        return Response({
            "current_month_total": current_total,
            "last_month_total": last_total,
            "category_breakdown": category_breakdown
        })
