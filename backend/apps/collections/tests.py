from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta

from apps.farmers.models import Farmer, FarmerLedger
from apps.customers.models import Customer, CustomerLedger
from apps.inventory.models import InventoryTransaction
from apps.products.models import Product, ProductInventoryTransaction, ProductSale
from apps.settings.models import MilkRate
from apps.collections.models import MilkCollection
from apps.payments.models import FarmerPayment
from apps.billing.models import Invoice

User = get_user_model()

class IntegrationPhase16Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin', password='password', is_staff=True, is_superuser=True)
        self.client.force_authenticate(user=self.user)

        self.farmer = Farmer.objects.create(name="Test Farmer", mobile_number="9999999999")
        self.customer = Customer.objects.create(name="Test Customer", mobile_number="8888888888")
        self.rate = MilkRate.objects.create(
            milk_type="COW", purchase_rate=Decimal('40.00'), selling_rate=Decimal('50.00'), 
            effective_from=date.today() - timedelta(days=1)
        )
        self.product = Product.objects.create(name="Test Ghee", unit_of_measure="kg", unit_price=Decimal('500.00'))

    def test_farmer_milk_collection_flow(self):
        # 1. Simulate Collection via API
        payload = {
            "farmer": self.farmer.id,
            "collection_date": str(date.today()),
            "milk_type": "COW",
            "shift": "MORNING",
            "quantity": "50.00",
            "fat_percentage": "3.5",
            "snf_percentage": "8.5",
            "applied_rate": "40.00",
            "rate_id": self.rate.id
        }
        
        response = self.client.post('/api/v1/collections/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Check Farmer Ledger (Credit expected)
        ledger_entry = self.farmer.ledger_entries.first()
        self.assertIsNotNone(ledger_entry)
        self.assertEqual(ledger_entry.transaction_type, 'COLLECTION')
        self.assertEqual(ledger_entry.credit_amount, Decimal('2000.00'))
        self.assertEqual(ledger_entry.running_balance, Decimal('2000.00'))
        
        # 3. Check Inventory (Addition expected)
        inv_txn = InventoryTransaction.objects.first()
        self.assertIsNotNone(inv_txn)
        self.assertEqual(inv_txn.transaction_type, 'COLLECTION')
        self.assertEqual(inv_txn.quantity, Decimal('50.00'))
        self.assertEqual(inv_txn.milk_type, 'COW')

    def test_farmer_payment_flow(self):
        # Pre-seed a ledger balance
        FarmerLedger.objects.create(
            farmer=self.farmer, transaction_type='COLLECTION', reference_id=99,
            credit_amount=Decimal('3000.00'), running_balance=Decimal('3000.00')
        )
        
        # 1. Simulate Payment via API
        payload = {
            "farmer": self.farmer.id,
            "amount": "2000.00",
            "payment_method": "CASH"
        }
        response = self.client.post('/api/v1/payments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Check Farmer Ledger (Debit expected)
        ledger_entry = self.farmer.ledger_entries.order_by('-id').first()
        self.assertEqual(ledger_entry.transaction_type, 'PAYMENT')
        self.assertEqual(ledger_entry.debit_amount, Decimal('2000.00'))
        self.assertEqual(ledger_entry.running_balance, Decimal('1000.00')) # 3000 - 2000

    def test_product_sales_flow(self):
        # 1. Simulate Product Sale via API
        payload = {
            "customer": self.customer.id,
            "product": self.product.id,
            "quantity": "5.00",
            "unit_price": "500.00",
            "paid_amount": "0.00"
        }
        response = self.client.post('/api/v1/products/sales/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Check Customer Ledger (Debit expected)
        ledger_entry = self.customer.ledger_entries.first()
        self.assertIsNotNone(ledger_entry)
        self.assertEqual(ledger_entry.transaction_type, 'SALE')
        self.assertEqual(ledger_entry.debit_amount, Decimal('2500.00'))
        self.assertEqual(ledger_entry.running_balance, Decimal('2500.00'))
        
        # 3. Check Product Inventory (Sale deduction expected)
        inv_txn = ProductInventoryTransaction.objects.first()
        self.assertIsNotNone(inv_txn)
        self.assertEqual(inv_txn.transaction_type, 'SALE')
        self.assertEqual(inv_txn.quantity, Decimal('5.00'))

    def test_billing_overlap_check(self):
        # Pre-seed an invoice
        start_date = date.today() - timedelta(days=5)
        end_date = date.today()
        Invoice.objects.create(
            customer=self.customer, start_date=start_date, end_date=end_date,
            total_amount=Decimal('100.00'), created_by=self.user
        )
        
        # Attempt to generate an overlapping invoice
        payload = {
            "customer": self.customer.id,
            "start_date": str(start_date + timedelta(days=2)), # Overlaps!
            "end_date": str(date.today() + timedelta(days=5))
        }
        response = self.client.post('/api/v1/billing/generate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertTrue('An invoice already exists' in response.data['error'])
