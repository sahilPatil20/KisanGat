import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:8000/api/v1"

with open("test_api_out.txt", "w") as f:
    def log(msg):
        f.write(msg + "\n")
        f.flush()

    def authenticate():
        req = urllib.request.Request(
            f"{BASE_URL}/auth/jwt/create/",
            data=json.dumps({"username": "admin", "password": "password"}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        try:
            response = urllib.request.urlopen(req)
            data = json.loads(response.read().decode('utf-8'))
            return data['access']
        except urllib.error.HTTPError as e:
            log(f"Failed to authenticate. Is the server running and admin/password correct? ({e.code})")
            return None

    def test_api():
        token = authenticate()
        if not token:
            return
            
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        log("✓ Successfully authenticated via JWT")
        
        # 1. Fetch Farmers
        req = urllib.request.Request(f"{BASE_URL}/farmers/", headers=headers)
        response = urllib.request.urlopen(req)
        farmers = json.loads(response.read().decode('utf-8'))
        log(f"✓ Fetched {len(farmers)} farmers successfully")
        
        if not farmers:
            log("No farmers found, skipping further tests")
            return
            
        farmer_id = farmers[0]['id']
        
        # 2. Test Fetching Pending Dues
        req = urllib.request.Request(f"{BASE_URL}/payments/pending-dues/", headers=headers)
        response = urllib.request.urlopen(req)
        pending_dues = json.loads(response.read().decode('utf-8'))
        log(f"✓ Fetched pending dues: {len(pending_dues)} farmers have dues")
        
        # 3. Fetch Products
        req = urllib.request.Request(f"{BASE_URL}/products/", headers=headers)
        response = urllib.request.urlopen(req)
        products = json.loads(response.read().decode('utf-8'))
        log(f"✓ Fetched {len(products)} products")
        
        # 4. Fetch Inventory Status
        req = urllib.request.Request(f"{BASE_URL}/inventory/current-stock/", headers=headers)
        response = urllib.request.urlopen(req)
        stock = json.loads(response.read().decode('utf-8'))
        log(f"✓ Current stock fetched: {stock}")

        log("\n✓ ALL BASIC API INTEGRATION TESTS PASSED")

    test_api()
