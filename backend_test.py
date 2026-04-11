import requests
import sys
import json
from datetime import datetime

class CampusCraveAPITester:
    def __init__(self, base_url="https://voice-order-app-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.log_test(name, True)
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return None

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return None

    def test_auth_flows(self):
        """Test authentication for all user roles"""
        print("\n🔐 Testing Authentication Flows...")
        
        # Test credentials from test_credentials.md
        test_users = [
            {"email": "student@lpu.in", "password": "student123", "role": "student"},
            {"email": "dominos@campuscrave.com", "password": "staff123", "role": "outlet_staff"},
            {"email": "admin@campuscrave.com", "password": "admin123", "role": "admin"}
        ]

        for user_data in test_users:
            result = self.run_test(
                f"Login {user_data['role']}",
                "POST",
                "auth/login",
                200,
                {"email": user_data["email"], "password": user_data["password"]}
            )
            
            if result and 'token' in result:
                self.tokens[user_data['role']] = result['token']
                self.users[user_data['role']] = result['user']
                print(f"  📝 {user_data['role']} token: {result['token'][:20]}...")
            else:
                print(f"  ❌ Failed to get token for {user_data['role']}")

    def test_venues_api(self):
        """Test venues API"""
        print("\n🏪 Testing Venues API...")
        
        # Get all venues
        venues = self.run_test("Get all venues", "GET", "venues", 200)
        if venues:
            food_courts = [v for v in venues if v.get('type') == 'food_court']
            provision_stores = [v for v in venues if v.get('type') == 'provision_store']
            
            print(f"  📊 Found {len(food_courts)} food courts, {len(provision_stores)} provision stores")
            
            # Test expected counts
            if len(food_courts) >= 8:
                self.log_test("Food courts count (≥8)", True)
            else:
                self.log_test("Food courts count (≥8)", False, f"Only found {len(food_courts)}")
                
            if len(provision_stores) >= 3:
                self.log_test("Provision stores count (≥3)", True)
            else:
                self.log_test("Provision stores count (≥3)", False, f"Only found {len(provision_stores)}")

            # Test menu for first venue
            if venues:
                venue_id = venues[0]['id']
                menu = self.run_test(f"Get menu for venue {venue_id[:8]}", "GET", f"venues/{venue_id}/menu", 200)
                if menu:
                    print(f"  📋 Menu has {len(menu)} items")

    def test_cart_operations(self):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        if 'student' not in self.tokens:
            print("  ⚠️ Skipping cart tests - no student token")
            return

        headers = {'Authorization': f'Bearer {self.tokens["student"]}'}
        
        # Get venues first
        venues = self.run_test("Get venues for cart test", "GET", "venues", 200)
        if not venues:
            print("  ❌ Cannot test cart - no venues available")
            return

        # Get menu items
        venue_id = venues[0]['id']
        menu = self.run_test("Get menu for cart test", "GET", f"venues/{venue_id}/menu", 200)
        if not menu:
            print("  ❌ Cannot test cart - no menu items")
            return

        # Add item to cart
        menu_item_id = menu[0]['id']
        cart_item = self.run_test(
            "Add item to cart",
            "POST",
            "cart",
            200,
            {
                "menu_item_id": menu_item_id,
                "quantity": 2,
                "special_instructions": "Test instructions"
            },
            headers
        )

        # Get cart
        cart = self.run_test("Get cart", "GET", "cart", 200, headers=headers)
        if cart:
            print(f"  📦 Cart has {len(cart)} items")

        # Remove item from cart
        if cart_item and 'id' in cart_item:
            self.run_test("Remove item from cart", "DELETE", f"cart/{cart_item['id']}", 200, headers=headers)

    def test_order_operations(self):
        """Test order operations"""
        print("\n📦 Testing Order Operations...")
        
        if 'student' not in self.tokens:
            print("  ⚠️ Skipping order tests - no student token")
            return

        headers = {'Authorization': f'Bearer {self.tokens["student"]}'}
        
        # Get venues and menu
        venues = self.run_test("Get venues for order test", "GET", "venues", 200)
        if not venues:
            return

        venue_id = venues[0]['id']
        menu = self.run_test("Get menu for order test", "GET", f"venues/{venue_id}/menu", 200)
        if not menu:
            return

        # Create order
        order_data = {
            "items": [{
                "menu_item_id": menu[0]['id'],
                "name": menu[0]['name'],
                "quantity": 1,
                "price": menu[0]['price'],
                "special_instructions": "",
                "image_url": menu[0]['image_url']
            }],
            "total_amount": menu[0]['price'],
            "delivery_location": "Block 1",
            "venue_id": venue_id
        }

        order = self.run_test("Create order", "POST", "orders", 200, order_data, headers)
        if order:
            print(f"  📋 Created order: {order['id'][:8]}...")
            
            # Get orders
            orders = self.run_test("Get student orders", "GET", "orders", 200, headers=headers)
            if orders:
                print(f"  📊 Student has {len(orders)} orders")

        # Test outlet staff orders
        if 'outlet_staff' in self.tokens:
            outlet_headers = {'Authorization': f'Bearer {self.tokens["outlet_staff"]}'}
            outlet_orders = self.run_test("Get outlet orders", "GET", "orders", 200, headers=outlet_headers)
            if outlet_orders:
                print(f"  🏪 Outlet has {len(outlet_orders)} orders")

                # Test order status update
                if outlet_orders:
                    order_id = outlet_orders[0]['id']
                    self.run_test(
                        "Update order status",
                        "PATCH",
                        f"orders/{order_id}/status",
                        200,
                        {"status": "preparing"},
                        outlet_headers
                    )

    def test_analytics_api(self):
        """Test analytics API"""
        print("\n📊 Testing Analytics API...")
        
        if 'admin' not in self.tokens:
            print("  ⚠️ Skipping analytics tests - no admin token")
            return

        headers = {'Authorization': f'Bearer {self.tokens["admin"]}'}
        analytics = self.run_test("Get analytics", "GET", "analytics", 200, headers=headers)
        
        if analytics:
            print(f"  📈 Total orders: {analytics.get('total_orders', 0)}")
            print(f"  💰 Total revenue: ₹{analytics.get('total_revenue', 0)}")
            print(f"  🏪 Venue stats: {len(analytics.get('venue_stats', []))} venues")

    def test_external_pickup(self):
        """Test external pickup API"""
        print("\n🚚 Testing External Pickup API...")
        
        if 'student' not in self.tokens:
            print("  ⚠️ Skipping external pickup tests - no student token")
            return

        headers = {'Authorization': f'Bearer {self.tokens["student"]}'}
        
        external_order_data = {
            "screenshot_url": "data:image/png;base64,test",
            "delivery_time": "4:30 PM today",
            "delivery_location": "Block 1"
        }

        self.run_test(
            "Create external pickup order",
            "POST",
            "external-orders",
            200,
            external_order_data,
            headers
        )

    def test_file_upload(self):
        """Test file upload API"""
        print("\n📁 Testing File Upload API...")
        
        # Create a simple test file
        test_content = b"test file content"
        files = {'file': ('test.txt', test_content, 'text/plain')}
        
        try:
            response = requests.post(f"{self.api_url}/upload", files=files, timeout=10)
            if response.status_code == 200:
                self.log_test("File upload", True)
                result = response.json()
                print(f"  📎 Uploaded file: {result.get('path', 'unknown')}")
            else:
                self.log_test("File upload", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("File upload", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CampusCrave API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Test authentication first
        self.test_auth_flows()
        
        # Test core APIs
        self.test_venues_api()
        self.test_cart_operations()
        self.test_order_operations()
        self.test_analytics_api()
        self.test_external_pickup()
        self.test_file_upload()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CampusCraveAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())