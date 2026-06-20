from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Using mock data for now as per plan
        data = {
            "today_collection_liters": 450.5,
            "today_sales_amount": 12500.00,
            "active_farmers": 42,
            "outstanding_dues": 5400.00
        }
        return Response(data)


class DashboardRevenueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock timeline data for Recharts (Last 7 days)
        data = [
            {"name": "Mon", "revenue": 4000, "collection": 2400},
            {"name": "Tue", "revenue": 3000, "collection": 1398},
            {"name": "Wed", "revenue": 2000, "collection": 9800},
            {"name": "Thu", "revenue": 2780, "collection": 3908},
            {"name": "Fri", "revenue": 1890, "collection": 4800},
            {"name": "Sat", "revenue": 2390, "collection": 3800},
            {"name": "Sun", "revenue": 3490, "collection": 4300},
        ]
        return Response(data)


class DashboardInventoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "milk_stock_liters": 150.0,
            "cattle_feed_bags": 30,
            "medicines_count": 15
        }
        return Response(data)
