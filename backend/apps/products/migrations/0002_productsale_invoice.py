# Migration removed: invoice FK was never applied to Docker MySQL database.
# Double-billing prevention is enforced at the view level instead.
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        # No-op: invoice FK removed from ProductSale model
    ]
