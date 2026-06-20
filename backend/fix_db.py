"""
Direct database fix: Add missing invoice_id columns to milk_sales and product_sales tables.
All output goes to fix_db_output.txt
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.db import connection

OUT = open('fix_db_output.txt', 'w')

def log(msg):
    OUT.write(msg + '\n')
    OUT.flush()

def run_sql(sql):
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            if sql.strip().upper().startswith(('SELECT', 'SHOW', 'DESC')):
                results = cursor.fetchall()
                columns = [col[0] for col in cursor.description] if cursor.description else []
                return columns, results
            else:
                return None, f"OK - {cursor.rowcount} rows affected"
    except Exception as e:
        return None, f"ERROR: {e}"

log("STEP 1: milk_sales schema")
cols, rows = run_sql("DESCRIBE milk_sales;")
if cols:
    for row in rows:
        log(f"  {row[0]:25s} {row[1]}")
    field_names = [row[0] for row in rows]
    has_invoice = 'invoice_id' in field_names
    log(f"  Has invoice_id: {has_invoice}")
else:
    log(f"  {rows}")
    has_invoice = False

log("\nSTEP 2: product_sales schema")
cols, rows = run_sql("DESCRIBE product_sales;")
if cols:
    for row in rows:
        log(f"  {row[0]:25s} {row[1]}")
    field_names_ps = [row[0] for row in rows]
    has_invoice_ps = 'invoice_id' in field_names_ps
    log(f"  Has invoice_id: {has_invoice_ps}")
else:
    log(f"  {rows}")
    has_invoice_ps = False

log("\nSTEP 3: invoices table PK type")
cols, rows = run_sql("DESCRIBE invoices;")
if cols:
    for row in rows:
        if row[0] == 'id':
            log(f"  invoices.id type: {row[1]}")
            break

log("\nSTEP 4: Migration history")
cols, rows = run_sql("SELECT app, name FROM django_migrations WHERE app IN ('sales', 'products', 'billing') ORDER BY app, name;")
if cols:
    for row in rows:
        log(f"  {row[0]:12s} {row[1]}")
else:
    log(f"  {rows}")

log("\nSTEP 5: Adding invoice_id to milk_sales")
if has_invoice:
    log("  SKIPPED: already exists")
else:
    _, result = run_sql("ALTER TABLE milk_sales ADD COLUMN invoice_id CHAR(32) NULL DEFAULT NULL;")
    log(f"  {result}")

log("\nSTEP 6: Adding invoice_id to product_sales")
if has_invoice_ps:
    log("  SKIPPED: already exists")
else:
    _, result = run_sql("ALTER TABLE product_sales ADD COLUMN invoice_id CHAR(32) NULL DEFAULT NULL;")
    log(f"  {result}")

log("\nSTEP 7: Record migrations")
cols, rows = run_sql("SELECT name FROM django_migrations WHERE app='sales' AND name='0004_milksale_invoice';")
if cols and len(rows) > 0:
    log("  sales/0004: already recorded")
else:
    _, r = run_sql("INSERT INTO django_migrations (app, name, applied) VALUES ('sales', '0004_milksale_invoice', NOW());")
    log(f"  sales/0004: {r}")

cols, rows = run_sql("SELECT name FROM django_migrations WHERE app='products' AND name='0002_productsale_invoice';")
if cols and len(rows) > 0:
    log("  products/0002: already recorded")
else:
    _, r = run_sql("INSERT INTO django_migrations (app, name, applied) VALUES ('products', '0002_productsale_invoice', NOW());")
    log(f"  products/0002: {r}")

log("\nSTEP 8: Verify")
cols, rows = run_sql("DESCRIBE milk_sales;")
if cols:
    fn = [row[0] for row in rows]
    log(f"  milk_sales has invoice_id: {'invoice_id' in fn}")
cols, rows = run_sql("DESCRIBE product_sales;")
if cols:
    fn = [row[0] for row in rows]
    log(f"  product_sales has invoice_id: {'invoice_id' in fn}")

log("\nSTEP 9: Test MilkSale ORM query")
try:
    from apps.sales.models import MilkSale
    count = MilkSale.objects.count()
    log(f"  MilkSale.objects.count() = {count}  SUCCESS")
except Exception as e:
    log(f"  FAILED: {e}")

log("\nSTEP 10: Test serializer")
try:
    from apps.sales.serializers import MilkSaleSerializer
    from apps.customers.models import Customer
    customer = Customer.objects.filter(is_deleted=False).first()
    if customer:
        test_data = {
            'sale_date': '2026-06-20', 'shift': 'MORNING', 'customer': customer.id,
            'milk_type': 'COW', 'quantity': '20', 'applied_rate': '59',
            'payment_status': 'PARTIAL', 'paid_amount': '550',
        }
        ser = MilkSaleSerializer(data=test_data)
        valid = ser.is_valid()
        log(f"  Valid: {valid}")
        if not valid:
            log(f"  Errors: {ser.errors}")
except Exception as e:
    log(f"  FAILED: {e}")

log("\nDONE.")
OUT.close()
