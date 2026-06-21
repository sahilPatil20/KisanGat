from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
import datetime
from .models import Invoice
from .serializers import InvoiceSerializer
from apps.customers.models import Customer
from apps.sales.models import MilkSale
from apps.products.models import ProductSale

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='preview')
    def preview_invoice(self, request):
        customer_id = request.data.get('customer')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not all([customer_id, start_date, end_date]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        overlapping = Invoice.objects.filter(customer=customer, start_date__lte=end_date, end_date__gte=start_date).exists()
        if overlapping:
            return Response({'error': 'An invoice already exists for this date range'}, status=status.HTTP_400_BAD_REQUEST)

        milk_sales = MilkSale.objects.filter(customer=customer, sale_date__gte=start_date, sale_date__lte=end_date)
        milk_total = milk_sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        product_sales = ProductSale.objects.filter(customer=customer, sale_date__gte=start_date, sale_date__lte=end_date)
        product_total = product_sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        total_amount = milk_total + product_total

        if total_amount == 0:
            return Response({'error': 'No unbilled sales found for this customer in the specified date range'}, status=status.HTTP_400_BAD_REQUEST)

        milk_items = [{
            'date': ms.sale_date, 'description': f"{ms.get_milk_type_display()} Milk",
            'quantity': float(ms.quantity), 'unit': 'L', 'unit_price': float(ms.applied_rate), 'total': float(ms.total_amount)
        } for ms in milk_sales]

        product_items = [{
            'date': ps.sale_date, 'description': ps.product.name,
            'quantity': float(ps.quantity), 'unit': ps.product.unit_of_measure, 'unit_price': float(ps.unit_price), 'total': float(ps.total_amount)
        } for ps in product_sales]

        return Response({
            'invoice_preview': {
                'customer_name': customer.name,
                'customer_phone': customer.phone if hasattr(customer, 'phone') else customer.mobile_number,
                'start_date': start_date,
                'end_date': end_date,
                'total_amount': float(total_amount),
            },
            'line_items': sorted(milk_items + product_items, key=lambda x: x['date'])
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_invoice(self, request):
        customer_id = request.data.get('customer')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not all([customer_id, start_date, end_date]):
            return Response({'error': 'Missing required fields (customer, start_date, end_date)'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check for overlapping invoices
        overlapping_invoices = Invoice.objects.filter(
            customer=customer,
            start_date__lte=end_date,
            end_date__gte=start_date
        )
        if overlapping_invoices.exists():
            return Response({'error': 'An invoice already exists for some or all of the specified date range'}, status=status.HTTP_400_BAD_REQUEST)

        # Query Milk Sales
        milk_sales = MilkSale.objects.filter(
            customer=customer,
            sale_date__gte=start_date,
            sale_date__lte=end_date
        )
        milk_total = milk_sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Query Product Sales
        product_sales = ProductSale.objects.filter(
            customer=customer,
            sale_date__gte=start_date,
            sale_date__lte=end_date
        )
        product_total = product_sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        total_amount = milk_total + product_total

        if total_amount == 0:
            return Response({'error': 'No unbilled sales found for this customer in the specified date range'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Create Invoice
            invoice = Invoice.objects.create(
                customer=customer,
                start_date=start_date,
                end_date=end_date,
                total_amount=total_amount,
                created_by=request.user
            )

        # Collect line items to return in response for the PDF view
        milk_items = []
        for ms in milk_sales:
            milk_items.append({
                'date': ms.sale_date,
                'description': f"{ms.get_milk_type_display()} Milk",
                'quantity': float(ms.quantity),
                'unit': 'L',
                'unit_price': float(ms.applied_rate),
                'total': float(ms.total_amount)
            })

        product_items = []
        for ps in product_sales:
            product_items.append({
                'date': ps.sale_date,
                'description': ps.product.name,
                'quantity': float(ps.quantity),
                'unit': ps.product.unit_of_measure,
                'unit_price': float(ps.unit_price),
                'total': float(ps.total_amount)
            })

        serializer = self.get_serializer(invoice)
        
        return Response({
            'invoice': serializer.data,
            'line_items': milk_items + product_items
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='details')
    def invoice_details(self, request, pk=None):
        invoice = self.get_object()
        
        # Get line items
        milk_sales = MilkSale.objects.filter(
            customer=invoice.customer,
            sale_date__gte=invoice.start_date,
            sale_date__lte=invoice.end_date
        )
        
        product_sales = ProductSale.objects.filter(
            customer=invoice.customer,
            sale_date__gte=invoice.start_date,
            sale_date__lte=invoice.end_date
        )
        
        milk_items = []
        for ms in milk_sales:
            milk_items.append({
                'date': ms.sale_date,
                'description': f"{ms.get_milk_type_display()} Milk",
                'quantity': float(ms.quantity),
                'unit': 'L',
                'unit_price': float(ms.applied_rate),
                'total': float(ms.total_amount)
            })

        product_items = []
        for ps in product_sales:
            product_items.append({
                'date': ps.sale_date,
                'description': ps.product.name,
                'quantity': float(ps.quantity),
                'unit': ps.product.unit_of_measure,
                'unit_price': float(ps.unit_price),
                'total': float(ps.total_amount)
            })
            
        line_items = sorted(milk_items + product_items, key=lambda x: x['date'])

        serializer = self.get_serializer(invoice)
        return Response({
            'invoice': serializer.data,
            'line_items': line_items
        })
