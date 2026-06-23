import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from decimal import Decimal
from django.db import transaction as db_transaction

try:
    from apps.customers.models import Customer, CustomerLedger, CustomerPayment
    from apps.sales.models import MilkSale
    from apps.inventory.models import InventoryTransaction
    
    # Check customer exists
    customer = Customer.objects.filter(is_deleted=False).first()
    if not customer:
        print("ERROR: No active customer found")
        sys.exit(1)
    print(f"Customer: {customer.name} (ID={customer.id})")
    
    # Simulate the exact serializer validation
    from apps.sales.serializers import MilkSaleSerializer
    test_data = {
        'sale_date': '2026-06-20',
        'shift': 'MORNING',
        'customer': customer.id,
        'milk_type': 'COW',
        'quantity': '20',
        'applied_rate': '59',
        'payment_status': 'PARTIAL',
        'paid_amount': '550',
        'remarks': ''
    }
    
    print(f"\nTest payload: {test_data}")
    
    serializer = MilkSaleSerializer(data=test_data)
    if not serializer.is_valid():
        print(f"\nSERIALIZER ERRORS: {serializer.errors}")
        sys.exit(1)
    
    print(f"\nValidated data: {serializer.validated_data}")
    
    # Now try the full perform_create flow
    with db_transaction.atomic():
        quantity = Decimal(str(serializer.validated_data['quantity']))
        applied_rate = Decimal(str(serializer.validated_data['applied_rate']))
        total_amount = quantity * applied_rate
        paid_amount = serializer.validated_data.pop('paid_amount', Decimal('0.00'))
        
        print(f"\ntotal_amount: {total_amount}")
        print(f"paid_amount: {paid_amount}")
        
        sale = serializer.save(total_amount=total_amount)
        print(f"\nSale created: ID={sale.id}")
        
        # Ledger debit
        latest_ledger = customer.ledger_entries.order_by('-transaction_date', '-id').first()
        previous_balance = latest_ledger.running_balance if latest_ledger else Decimal('0.00')
        new_balance = previous_balance + total_amount
        
        ledger_entry = CustomerLedger.objects.create(
            customer=customer,
            transaction_type='SALE',
            reference_id=sale.id,
            debit_amount=total_amount,
            running_balance=new_balance,
            remarks=f"{sale.get_shift_display()} Shift - {sale.get_milk_type_display()} Milk: {quantity}L"
        )
        print(f"Ledger debit created: ID={ledger_entry.id}, balance={new_balance}")
        
        # Payment
        if paid_amount > Decimal('0.00'):
            payment = CustomerPayment.objects.create(
                customer=customer,
                amount=paid_amount,
                payment_method='CASH',
                remarks=f"Payment received during sale #{sale.id}"
            )
            print(f"Payment created: ID={payment.id}")
            
            new_balance_after_payment = new_balance - paid_amount
            ledger_credit = CustomerLedger.objects.create(
                customer=customer,
                transaction_type='PAYMENT',
                reference_id=payment.id,
                credit_amount=paid_amount,
                running_balance=new_balance_after_payment,
                remarks=f"Payment for sale #{sale.id}"
            )
            print(f"Ledger credit created: ID={ledger_credit.id}, balance={new_balance_after_payment}")
        
        # Inventory
        inv_txn = InventoryTransaction.objects.create(
            transaction_type='SALE',
            milk_type=sale.milk_type,
            quantity=quantity,
            reference_id=sale.id,
            remarks=f"Sale to {customer.name} (Shift: {sale.get_shift_display()})"
        )
        print(f"Inventory transaction created: ID={inv_txn.id}")
        
        # ROLLBACK - this is a test
        raise Exception("TEST COMPLETE - ROLLING BACK")

except Exception as e:
    print(f"\n{'='*60}")
    print(f"RESULT: {e}")
    import traceback
    traceback.print_exc()
