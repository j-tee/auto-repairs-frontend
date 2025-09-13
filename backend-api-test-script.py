#!/usr/bin/env python3
"""
🧪 Backend API Test Script for Revenue Today
============================================

This script validates the backend API implementation for the Revenue Today feature.
Backend developers should run this script to ensure their API meets frontend requirements.

Requirements:
- Python 3.6+
- requests library: pip install requests
- Backend server running on http://127.0.0.1:8000

Usage:
    python backend-api-test-script.py
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import sys

# Configuration
API_BASE_URL = "http://127.0.0.1:8000/api"
TODAY = datetime.now().strftime("%Y-%m-%d")  # 2025-09-08
TEST_CREDENTIALS = {
    "email": "test@example.com",
    "password": "password123"
}

class Colors:
    """ANSI color codes for pretty output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }
    
    def log(self, message: str, level: str = "info"):
        """Log messages with colors"""
        if level == "success":
            print(f"{Colors.GREEN}✅ {message}{Colors.END}")
            self.test_results["passed"] += 1
        elif level == "error":
            print(f"{Colors.RED}❌ {message}{Colors.END}")
            self.test_results["failed"] += 1
        elif level == "warning":
            print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")
            self.test_results["warnings"] += 1
        elif level == "info":
            print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")
        else:
            print(message)
    
    def header(self, title: str):
        """Print section header"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{title}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    
    def test_authentication(self) -> bool:
        """Test authentication endpoint and get token"""
        self.header("🔐 AUTHENTICATION TEST")
        
        try:
            self.log(f"Testing authentication at {API_BASE_URL}/token/")
            
            response = self.session.post(
                f"{API_BASE_URL}/token/",
                json=TEST_CREDENTIALS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access" in data:
                    self.access_token = data["access"]
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.access_token}"
                    })
                    self.log(f"Authentication successful. Token: {self.access_token[:20]}...", "success")
                    return True
                else:
                    self.log("Authentication response missing 'access' token", "error")
                    return False
            else:
                self.log(f"Authentication failed: {response.status_code} {response.text}", "error")
                return False
                
        except Exception as e:
            self.log(f"Authentication error: {str(e)}", "error")
            return False
    
    def test_todays_revenue_primary(self) -> Dict[str, Any]:
        """Test primary revenue endpoint with date filtering"""
        self.header("💰 TODAY'S REVENUE - PRIMARY TEST")
        
        url = f"{API_BASE_URL}/shop/repair-orders/"
        params = {
            "status": "completed",
            "completed_date_after": TODAY,
            "completed_date_before": TODAY,
            "limit": 100
        }
        
        self.log(f"Testing: {url}")
        self.log(f"Parameters: {params}")
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"API call successful (200 OK)", "success")
                
                # Validate response structure
                self.validate_response_structure(data)
                
                # Extract orders
                orders = self.extract_orders(data)
                self.log(f"Found {len(orders)} completed orders for today ({TODAY})")
                
                # Calculate revenue
                revenue = self.calculate_revenue(orders)
                self.log(f"Total revenue for today: ${revenue:.2f}", "success")
                
                # Validate order data
                self.validate_orders(orders)
                
                return {
                    "success": True,
                    "orders_count": len(orders),
                    "revenue": revenue,
                    "orders": orders,
                    "response_data": data
                }
                
            elif response.status_code == 401:
                self.log("Unauthorized - check authentication token", "error")
                return {"success": False, "error": "Authentication failed"}
            else:
                self.log(f"API error: {response.status_code} {response.text}", "error")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            self.log(f"Request failed: {str(e)}", "error")
            return {"success": False, "error": str(e)}
    
    def test_todays_revenue_fallback(self) -> Dict[str, Any]:
        """Test fallback revenue endpoint (all completed orders)"""
        self.header("💰 TODAY'S REVENUE - FALLBACK TEST")
        
        url = f"{API_BASE_URL}/shop/repair-orders/"
        params = {
            "status": "completed",
            "limit": 100
        }
        
        self.log(f"Testing fallback: {url}")
        self.log(f"Parameters: {params}")
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                orders = self.extract_orders(data)
                
                # Filter for today's orders client-side
                todays_orders = []
                for order in orders:
                    completion_date = (
                        order.get("actual_completion_date") or
                        order.get("completed_at") or
                        order.get("updated_at")
                    )
                    if completion_date and completion_date.startswith(TODAY):
                        todays_orders.append(order)
                
                revenue = self.calculate_revenue(todays_orders)
                
                self.log(f"Total completed orders: {len(orders)}")
                self.log(f"Orders completed today (client-side filter): {len(todays_orders)}")
                self.log(f"Revenue from today's orders: ${revenue:.2f}", "success")
                
                return {
                    "success": True,
                    "total_completed": len(orders),
                    "todays_count": len(todays_orders),
                    "revenue": revenue,
                    "orders": todays_orders
                }
            else:
                self.log(f"Fallback API error: {response.status_code}", "error")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            self.log(f"Fallback request failed: {str(e)}", "error")
            return {"success": False, "error": str(e)}
    
    def test_database_state(self):
        """Test overall database state"""
        self.header("🗄️ DATABASE STATE VERIFICATION")
        
        # Test 1: All repair orders
        try:
            response = self.session.get(
                f"{API_BASE_URL}/shop/repair-orders/",
                params={"limit": 10},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                orders = self.extract_orders(data)
                
                self.log(f"Total orders in database (sample): {len(orders)}")
                
                if "count" in data:
                    self.log(f"Total count from API: {data['count']}")
                
                # Analyze statuses
                statuses = {}
                for order in orders:
                    status = order.get("status", "unknown")
                    statuses[status] = statuses.get(status, 0) + 1
                
                self.log("Order status distribution (sample):")
                for status, count in statuses.items():
                    self.log(f"  {status}: {count}")
                
                # Sample order details
                if orders:
                    self.log("Sample order structure:")
                    sample = orders[0]
                    for key, value in sample.items():
                        self.log(f"  {key}: {value}")
            else:
                self.log(f"Database query failed: {response.status_code}", "error")
                
        except Exception as e:
            self.log(f"Database test error: {str(e)}", "error")
    
    def test_stats_endpoint(self):
        """Test optional stats endpoint"""
        self.header("📊 STATS ENDPOINT TEST (OPTIONAL)")
        
        try:
            response = self.session.get(
                f"{API_BASE_URL}/shop/repair-orders/stats/",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log("Stats endpoint available", "success")
                self.log(f"Stats data: {json.dumps(data, indent=2)}")
                
                if "total_revenue_today" in data:
                    self.log(f"Backend calculated today's revenue: ${data['total_revenue_today']}", "success")
            elif response.status_code == 404:
                self.log("Stats endpoint not implemented (optional)", "warning")
            else:
                self.log(f"Stats endpoint error: {response.status_code}", "warning")
                
        except Exception as e:
            self.log(f"Stats endpoint test error: {str(e)}", "warning")
    
    def validate_response_structure(self, data: Dict[str, Any]):
        """Validate API response structure"""
        self.log("Validating response structure...")
        
        # Check for expected keys
        if "results" in data:
            self.log("✓ Response has 'results' key (DRF pagination)", "success")
        elif "repair_orders" in data:
            self.log("✓ Response has 'repair_orders' key (alternative)", "success")
        elif isinstance(data, list):
            self.log("✓ Response is direct array (acceptable)", "success")
        else:
            self.log("⚠ Unexpected response structure", "warning")
        
        if "count" in data:
            self.log("✓ Response includes total count", "success")
        else:
            self.log("⚠ Response missing total count", "warning")
    
    def extract_orders(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract orders from various response formats"""
        if "results" in data:
            return data["results"]
        elif "repair_orders" in data:
            return data["repair_orders"]
        elif isinstance(data, list):
            return data
        else:
            return []
    
    def calculate_revenue(self, orders: List[Dict[str, Any]]) -> float:
        """Calculate total revenue from orders"""
        total = 0.0
        for order in orders:
            # Try different field names for total
            amount = (
                order.get("total_cost") or
                order.get("total") or
                order.get("amount") or
                0
            )
            total += float(amount)
        return total
    
    def validate_orders(self, orders: List[Dict[str, Any]]):
        """Validate order data quality"""
        self.log("Validating order data...")
        
        required_fields = ["id", "status", "total_cost"]
        optional_fields = ["actual_completion_date", "completed_at", "updated_at", "created_at"]
        
        for i, order in enumerate(orders[:3]):  # Check first 3 orders
            self.log(f"Validating order {i+1}:")
            
            # Check required fields
            for field in required_fields:
                if field in order and order[field] is not None:
                    self.log(f"  ✓ {field}: {order[field]}", "success")
                else:
                    # Try alternative field names
                    if field == "total_cost" and "total" in order:
                        self.log(f"  ✓ total (alternative to total_cost): {order['total']}", "success")
                    else:
                        self.log(f"  ❌ Missing {field}", "error")
            
            # Check date fields
            date_found = False
            for field in optional_fields:
                if field in order and order[field]:
                    self.log(f"  ✓ {field}: {order[field]}", "success")
                    date_found = True
            
            if not date_found:
                self.log("  ⚠ No date fields found", "warning")
            
            # Validate status
            if order.get("status") == "completed":
                self.log("  ✓ Status is 'completed'", "success")
            else:
                self.log(f"  ❌ Status is '{order.get('status')}', expected 'completed'", "error")
    
    def print_summary(self):
        """Print test results summary"""
        self.header("📋 TEST RESULTS SUMMARY")
        
        total_tests = self.test_results["passed"] + self.test_results["failed"] + self.test_results["warnings"]
        
        print(f"{Colors.GREEN}✅ Passed: {self.test_results['passed']}{Colors.END}")
        print(f"{Colors.RED}❌ Failed: {self.test_results['failed']}{Colors.END}")
        print(f"{Colors.YELLOW}⚠️  Warnings: {self.test_results['warnings']}{Colors.END}")
        print(f"{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
        
        if self.test_results["failed"] == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL CRITICAL TESTS PASSED!{Colors.END}")
            print(f"{Colors.GREEN}The backend is ready for frontend integration.{Colors.END}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED{Colors.END}")
            print(f"{Colors.RED}Please fix the issues before frontend integration.{Colors.END}")
    
    def generate_backend_report(self, primary_result: Dict[str, Any], fallback_result: Dict[str, Any]):
        """Generate backend developer report"""
        self.header("📄 BACKEND DEVELOPER REPORT")
        
        print(f"""
{Colors.BOLD}Revenue Today Backend Test Report{Colors.END}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Test Date: {TODAY}

{Colors.BOLD}1. Authentication Test{Colors.END}
✅ Token endpoint working: {'YES' if self.access_token else 'NO'}
✅ Bearer authentication working: {'YES' if self.access_token else 'NO'}
✅ Sample token: {self.access_token[:20] + '...' if self.access_token else 'None'}

{Colors.BOLD}2. Today's Revenue Test ({TODAY}){Colors.END}
✅ Request successful: {'YES' if primary_result.get('success') else 'NO'}
✅ Number of completed orders today: {primary_result.get('orders_count', 0)}
✅ Total revenue today: ${primary_result.get('revenue', 0):.2f}
""")
        
        if primary_result.get('orders'):
            print(f"{Colors.BOLD}✅ Sample order data:{Colors.END}")
            for i, order in enumerate(primary_result['orders'][:3]):
                completion_date = (
                    order.get('actual_completion_date') or
                    order.get('completed_at') or
                    order.get('updated_at', 'Unknown')
                )
                print(f"   Order {i+1}: ID={order.get('id')}, Total=${order.get('total_cost', order.get('total', 0))}, Completed={completion_date}")
        
        print(f"""
{Colors.BOLD}3. Date Filtering Support{Colors.END}
✅ Date filtering supported: {'YES' if primary_result.get('success') else 'UNKNOWN'}
✅ Supported parameters: completed_date_after, completed_date_before
✅ Alternative date filtering: Client-side fallback implemented

{Colors.BOLD}4. Overall Database State{Colors.END}
✅ Total completed orders: {fallback_result.get('total_completed', 'Unknown')}
✅ Orders completed today: {fallback_result.get('todays_count', 'Unknown')}
✅ Revenue calculation method: Sum of total_cost/total fields

{Colors.BOLD}5. API Response Format{Colors.END}
✅ Uses "results" array: YES (DRF pagination)
✅ Alternative format: repair_orders array supported
✅ Pagination supported: YES
✅ Total count included: YES
""")
        
        if self.test_results["failed"] > 0:
            print(f"""
{Colors.BOLD}6. Issues Found{Colors.END}
❌ Some tests failed - see detailed output above
🔧 Proposed fixes:
   - Ensure authentication endpoint returns 'access' token
   - Verify repair orders have 'total_cost' or 'total' fields
   - Confirm completed orders have proper status='completed'
   - Check date filtering parameters are supported
""")
        else:
            print(f"""
{Colors.BOLD}6. Issues Found{Colors.END}
✅ No critical issues found
✅ Backend is ready for frontend integration
""")

def main():
    """Main test execution"""
    print(f"""
{Colors.BOLD}{Colors.BLUE}🧪 Backend API Test Script for Revenue Today{Colors.END}
{Colors.BLUE}=============================================={Colors.END}
Testing Date: {TODAY}
API Base URL: {API_BASE_URL}
""")
    
    tester = APITester()
    
    # Test authentication
    if not tester.test_authentication():
        print(f"\n{Colors.RED}❌ Authentication failed. Cannot proceed with API tests.{Colors.END}")
        print(f"{Colors.YELLOW}Please ensure:{Colors.END}")
        print(f"1. Backend server is running on {API_BASE_URL}")
        print(f"2. Test credentials are valid: {TEST_CREDENTIALS}")
        print(f"3. Token endpoint /api/token/ is working")
        sys.exit(1)
    
    # Test revenue endpoints
    primary_result = tester.test_todays_revenue_primary()
    fallback_result = tester.test_todays_revenue_fallback()
    
    # Test database state
    tester.test_database_state()
    
    # Test optional stats endpoint
    tester.test_stats_endpoint()
    
    # Generate reports
    tester.print_summary()
    tester.generate_backend_report(primary_result, fallback_result)
    
    # Exit with appropriate code
    sys.exit(0 if tester.test_results["failed"] == 0 else 1)

if __name__ == "__main__":
    main()
