from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from decimal import Decimal

from apps.collections.models import MilkCollection
from apps.sales.models import MilkSale
from apps.products.models import ProductSale
from apps.farmers.models import Farmer, FarmerLedger
from apps.customers.models import CustomerLedger, CustomerPayment
from apps.inventory.models import InventoryTransaction

class DashboardOverviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        thirty_days_ago = today - timedelta(days=30)
        seven_days_ago = today - timedelta(days=7)

        # 1. Today's Milk Collection
        collections_today = MilkCollection.objects.filter(collection_date=today)
        cow_col = collections_today.filter(milk_type='COW').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        buffalo_col = collections_today.filter(milk_type='BUFFALO').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        mixed_col = collections_today.filter(milk_type='MIXED').aggregate(total=Sum('quantity'))['total'] or Decimal('0.00')
        total_col = cow_col + buffalo_col + mixed_col

        today_collection = {
            "total": float(total_col),
            "cow": float(cow_col),
            "buffalo": float(buffalo_col),
            "mixed": float(mixed_col)
        }

        # 2. Today's Sales Revenue
        milk_sales_today = MilkSale.objects.filter(sale_date=today)
        product_sales_today = ProductSale.objects.filter(sale_date=today)

        cow_rev = milk_sales_today.filter(milk_type='COW').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        buffalo_rev = milk_sales_today.filter(milk_type='BUFFALO').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        mixed_rev = milk_sales_today.filter(milk_type='MIXED').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        product_rev = product_sales_today.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        total_rev = cow_rev + buffalo_rev + mixed_rev + product_rev

        today_sales = {
            "total": float(total_rev),
            "cow_milk": float(cow_rev),
            "buffalo_milk": float(buffalo_rev),
            "dairy_products": float(product_rev)
        }

        # 3. Active Farmers
        total_farmers = Farmer.objects.filter(is_deleted=False).count()
        active_farmers = MilkCollection.objects.filter(collection_date__gte=thirty_days_ago).values('farmer').distinct().count()

        active_farmers_data = {
            "total": total_farmers,
            "active": active_farmers,
            "inactive": total_farmers - active_farmers
        }

        # 4. Customer Dues
        cl_aggr = CustomerLedger.objects.aggregate(total_debit=Sum('debit_amount'), total_credit=Sum('credit_amount'))
        total_dues = (cl_aggr['total_debit'] or Decimal('0.00')) - (cl_aggr['total_credit'] or Decimal('0.00'))

        # 5. Current Inventory
        inv_aggr = InventoryTransaction.objects.values('milk_type', 'transaction_type').annotate(total=Sum('quantity'))
        cow_stock = Decimal('0.00')
        buffalo_stock = Decimal('0.00')
        mixed_stock = Decimal('0.00')

        for item in inv_aggr:
            qty = item['total'] or Decimal('0.00')
            mt = item['milk_type']
            tt = item['transaction_type']
            
            # Additions
            if tt in ['COLLECTION', 'ADJUSTMENT_ADD']:
                if mt == 'COW': cow_stock += qty
                elif mt == 'BUFFALO': buffalo_stock += qty
                elif mt == 'MIXED': mixed_stock += qty
            # Subtractions
            elif tt in ['SALE', 'ADJUSTMENT_SUBTRACT']:
                if mt == 'COW': cow_stock -= qty
                elif mt == 'BUFFALO': buffalo_stock -= qty
                elif mt == 'MIXED': mixed_stock -= qty

        inventory_data = {
            "cow": float(cow_stock),
            "buffalo": float(buffalo_stock),
            "total": float(cow_stock + buffalo_stock + mixed_stock)
        }

        # 6. Farmer Payables
        fl_aggr = FarmerLedger.objects.aggregate(total_debit=Sum('debit_amount'), total_credit=Sum('credit_amount'))
        farmer_payables = (fl_aggr['total_credit'] or Decimal('0.00')) - (fl_aggr['total_debit'] or Decimal('0.00'))

        # 7. Today's Customers & Transactions
        unique_milk_customers = set(milk_sales_today.values_list('customer', flat=True))
        unique_product_customers = set(product_sales_today.values_list('customer', flat=True))
        unique_customers_today = len(unique_milk_customers.union(unique_product_customers))

        total_transactions_today = collections_today.count() + milk_sales_today.count() + product_sales_today.count()

        # 8. Revenue Analytics (Last 30 Days)
        revenue_chart = []
        # Group sales
        milk_sales_trend = MilkSale.objects.filter(sale_date__gte=thirty_days_ago).values('sale_date').annotate(total=Sum('total_amount'))
        product_sales_trend = ProductSale.objects.filter(sale_date__gte=thirty_days_ago).values('sale_date').annotate(total=Sum('total_amount'))
        collections_trend = MilkCollection.objects.filter(collection_date__gte=thirty_days_ago).values('collection_date').annotate(total=Sum('quantity'))

        # Map them by date
        trend_map = {}
        for d in range(30, -1, -1):
            date_str = str(today - timedelta(days=d))
            trend_map[date_str] = {"date": date_str, "revenue": 0.0, "collection": 0.0}

        for s in milk_sales_trend:
            ds = str(s['sale_date'])
            if ds in trend_map: trend_map[ds]['revenue'] += float(s['total'] or 0)
            
        for p in product_sales_trend:
            ds = str(p['sale_date'])
            if ds in trend_map: trend_map[ds]['revenue'] += float(p['total'] or 0)
            
        for c in collections_trend:
            ds = str(c['collection_date'])
            if ds in trend_map: trend_map[ds]['collection'] += float(c['total'] or 0)

        revenue_chart = list(trend_map.values())

        # 9. Recent Activity Feed
        recent_activities = []
        
        # We need a unified list, let's fetch last 5 from each and sort in python
        # Collections
        cols = MilkCollection.objects.all().order_by('-created_at')[:5]
        for c in cols:
            recent_activities.append({
                "type": "Milk Collection",
                "entity": c.farmer.name,
                "amount": f"{c.quantity} L",
                "timestamp": c.created_at,
                "status": "Success"
            })
            
        # Sales
        sales = MilkSale.objects.all().order_by('-created_at')[:5]
        for s in sales:
            recent_activities.append({
                "type": "Milk Sale",
                "entity": s.customer.name,
                "amount": f"₹{s.total_amount}",
                "timestamp": s.created_at,
                "status": "Success"
            })
            
        # Customer Payments
        c_pays = CustomerPayment.objects.all().order_by('-created_at')[:5]
        for cp in c_pays:
            recent_activities.append({
                "type": "Customer Payment",
                "entity": cp.customer.name,
                "amount": f"₹{cp.amount}",
                "timestamp": cp.created_at,
                "status": "Received"
            })

        # Sort combined
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:10]
        
        # Serialize timestamps
        for r in recent_activities:
            r['timestamp'] = r['timestamp'].isoformat()

        return Response({
            "today_collection": today_collection,
            "today_sales": today_sales,
            "active_farmers_data": active_farmers_data,
            "customer_dues": float(total_dues),
            "inventory": inventory_data,
            "farmer_payables": float(farmer_payables),
            "today_metrics": {
                "unique_customers": unique_customers_today,
                "total_transactions": total_transactions_today
            },
            "revenue_chart": revenue_chart,
            "recent_activities": recent_activities
        })
