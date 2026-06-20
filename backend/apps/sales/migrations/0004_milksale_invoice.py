# Migration removed: invoice FK was never applied to Docker MySQL database.
# Double-billing prevention is enforced at the view level instead.
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_milksale_payment_status_milksale_remarks'),
    ]

    operations = [
        # No-op: invoice FK removed from MilkSale model
    ]
