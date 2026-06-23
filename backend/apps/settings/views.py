from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import MilkRate, DairySettings, SystemSettings
from datetime import date

class ActiveRatesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        # Find active rates for COW and BUFFALO
        rates = {}
        for milk_type in ['COW', 'BUFFALO']:
            rate_obj = MilkRate.objects.filter(
                milk_type=milk_type, 
                is_active=True, 
                effective_from__lte=today
            ).order_by('-effective_from').first()
            
            if rate_obj:
                rates[milk_type] = {
                    "purchase_rate": float(rate_obj.purchase_rate),
                    "selling_rate": float(rate_obj.selling_rate)
                }
            else:
                rates[milk_type] = {
                    "purchase_rate": 0.0,
                    "selling_rate": 0.0
                }
                
        return Response(rates)

class SettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dairy = DairySettings.objects.first()
        dairy_info = {
            "dairy_name": dairy.dairy_name if dairy else "",
            "owner_name": dairy.owner_name if dairy else "",
            "address": dairy.address if dairy else "",
            "phone": dairy.phone if dairy else "",
            "gst_number": dairy.gst_number if dairy else "",
            "logo_path": dairy.logo_path if dairy else ""
        }

        # Fetch milk rates
        today = date.today()
        rates = {}
        for milk_type in ['COW', 'BUFFALO']:
            rate_obj = MilkRate.objects.filter(
                milk_type=milk_type, 
                is_active=True, 
                effective_from__lte=today
            ).order_by('-effective_from').first()
            
            rates[milk_type] = {
                "purchase_rate": float(rate_obj.purchase_rate) if rate_obj else 0.0,
                "selling_rate": float(rate_obj.selling_rate) if rate_obj else 0.0
            }

        # Fetch system preferences
        sys_settings = SystemSettings.objects.all()
        prefs = {s.setting_key: s.setting_value for s in sys_settings}

        return Response({
            "dairy": dairy_info,
            "rates": rates,
            "preferences": prefs
        })

    def put(self, request):
        data = request.data
        
        # Update dairy settings
        if 'dairy' in data:
            dairy, _ = DairySettings.objects.get_or_create(id=1)
            dairy_data = data['dairy']
            if 'dairy_name' in dairy_data: dairy.dairy_name = dairy_data['dairy_name']
            if 'owner_name' in dairy_data: dairy.owner_name = dairy_data['owner_name']
            if 'address' in dairy_data: dairy.address = dairy_data['address']
            if 'phone' in dairy_data: dairy.phone = dairy_data['phone']
            if 'gst_number' in dairy_data: dairy.gst_number = dairy_data['gst_number']
            if 'logo_path' in dairy_data: dairy.logo_path = dairy_data['logo_path']
            dairy.save()

        # Update milk rates
        if 'rates' in data:
            rates_data = data['rates']
            for m_type in ['COW', 'BUFFALO']:
                if m_type in rates_data:
                    # Deactivate old ones
                    MilkRate.objects.filter(milk_type=m_type, is_active=True).update(is_active=False)
                    MilkRate.objects.create(
                        milk_type=m_type,
                        purchase_rate=rates_data[m_type].get('purchase_rate', 0.0),
                        selling_rate=rates_data[m_type].get('selling_rate', 0.0),
                        effective_from=date.today(),
                        is_active=True
                    )
        
        # Update system preferences
        if 'preferences' in data:
            prefs_data = data['preferences']
            for key, val in prefs_data.items():
                SystemSettings.objects.update_or_create(
                    setting_key=key,
                    defaults={'setting_value': str(val)}
                )

        return Response({"message": "Settings updated successfully"}, status=status.HTTP_200_OK)
