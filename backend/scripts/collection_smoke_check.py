import os
import sys
import traceback

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

with open(os.path.join(BASE_DIR, 'test_output_2.txt'), 'w') as f:
    try:
        f.write("Starting test_post.py\n")
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()
        f.write("Django setup successful.\n")

        from apps.collections.serializers import MilkCollectionSerializer
        from apps.collections.views import MilkCollectionViewSet
        from apps.farmers.models import Farmer
        from django.contrib.auth import get_user_model
        farmer = Farmer.objects.first()
        f.write(f"Farmer: {farmer}\n")
        
        if not farmer:
            f.write("No farmer found.\n")
        else:
            data = {
                "collection_date": "2026-06-19",
                "shift": "MORNING",
                "farmer": farmer.id,
                "milk_type": "COW",
                "quantity": "3.1",
                "fat_percentage": "3.5",
                "snf_percentage": "0.5",
                "applied_rate": "55"
            }

            serializer = MilkCollectionSerializer(data=data)
            if serializer.is_valid():
                f.write("Serializer valid.\n")
                try:
                    viewset = MilkCollectionViewSet()
                    viewset.perform_create(serializer)
                    f.write("Success!\n")
                except Exception as e:
                    f.write("Exception inside perform_create:\n" + traceback.format_exc())
            else:
                f.write("Validation Error: " + str(serializer.errors) + "\n")
    except Exception as e:
        f.write("Outer Exception:\n" + traceback.format_exc())
# Wait, we need to login first to get the token. What is the admin username?
# Or we can just make the request using django test client locally.
