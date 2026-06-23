import sys, json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

try:
    from apps.customers.models import Customer, CustomerLedger, CustomerPayment
    from apps.billing.models import Invoice

    customer = Customer.objects.get(name__icontains='Sahil Patil')
    
    from django.db.models import Sum
    debits = customer.ledger_entries.aggregate(total=Sum('debit_amount'))['total'] or 0
    credits = customer.ledger_entries.aggregate(total=Sum('credit_amount'))['total'] or 0
    outstanding = debits - credits

    ledgers = list(customer.ledger_entries.order_by('transaction_date').values(
        'id', 'transaction_date', 'transaction_type', 'reference_id', 'debit_amount', 'credit_amount', 'running_balance'
    ))

    invoices = []
    for inv in customer.invoices.order_by('created_at'):
        invoices.append({
            'invoice_number': inv.invoice_number,
            'start_date': str(inv.start_date),
            'end_date': str(inv.end_date),
            'total_amount': inv.total_amount,
            'outstanding_amount': inv.outstanding_amount,
            'status': inv.status,
            'created_at': str(inv.created_at)
        })

    payments = list(customer.payments.values('id', 'amount', 'payment_date', 'payment_method'))

    output = {
        'customer': customer.name,
        'debits': debits,
        'credits': credits,
        'outstanding': outstanding,
        'ledgers': [
            {**l, 'transaction_date': str(l['transaction_date'])} for l in ledgers
        ],
        'invoices': invoices,
        'payments': [
            {**p, 'payment_date': str(p['payment_date'])} for p in payments
        ]
    }
    with open('debug_output.json', 'w') as f:
        json.dump(output, f, cls=DecimalEncoder, indent=2)

except Exception as e:
    import traceback
    with open('debug_output.json', 'w') as f:
        f.write(traceback.format_exc())
