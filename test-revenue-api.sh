#!/bin/bash

# 🧪 Backend Revenue API Test Script
# Usage: ./test-revenue-api.sh [email] [password]
# Example: ./test-revenue-api.sh admin@example.com password123

set -e

# Configuration
API_BASE="http://127.0.0.1:8000/api"
TODAY=$(date +%Y-%m-%d)
EMAIL=${1:-"admin@example.com"}
PASSWORD=${2:-"password123"}

echo "🚀 Auto Repair Shop - Revenue API Test Script"
echo "=============================================="
echo "📅 Testing for date: $TODAY"
echo "🌐 API Base URL: $API_BASE"
echo "👤 Email: $EMAIL"
echo ""

# Function to make authenticated requests
make_request() {
    local url="$1"
    local description="$2"
    
    echo "🔍 Testing: $description"
    echo "   URL: $url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        "$url")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    
    if [ "$http_code" -eq 200 ]; then
        echo "   ✅ Status: $http_code"
        echo "   📊 Response: $body" | jq '.' 2>/dev/null || echo "   📊 Response: $body"
    else
        echo "   ❌ Status: $http_code"
        echo "   📊 Response: $body"
    fi
    echo ""
}

# Step 1: Authenticate
echo "🔐 Step 1: Authentication"
echo "========================"

auth_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$API_BASE/token/" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

auth_http_code=$(echo "$auth_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
auth_body=$(echo "$auth_response" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')

if [ "$auth_http_code" -eq 200 ]; then
    TOKEN=$(echo "$auth_body" | jq -r '.access' 2>/dev/null || echo "")
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo "✅ Authentication successful"
        echo "🔑 Token: ${TOKEN:0:20}..."
        echo ""
    else
        echo "❌ Failed to extract token from response"
        echo "📊 Response: $auth_body"
        exit 1
    fi
else
    echo "❌ Authentication failed (HTTP $auth_http_code)"
    echo "📊 Response: $auth_body"
    echo ""
    echo "💡 Please check:"
    echo "   - Backend server is running on $API_BASE"
    echo "   - Credentials are correct: $EMAIL / [password]"
    echo "   - Token endpoint exists at $API_BASE/token/"
    exit 1
fi

# Step 2: Test Today's Revenue (Primary Test)
echo "💰 Step 2: Today's Revenue Test"
echo "==============================="
make_request "$API_BASE/shop/repair-orders/?status=completed&completed_date_after=$TODAY&completed_date_before=$TODAY&limit=100" \
            "Today's completed orders"

# Step 3: Test All Completed Orders (Fallback)
echo "📋 Step 3: All Completed Orders (Fallback)"
echo "=========================================="
make_request "$API_BASE/shop/repair-orders/?status=completed&limit=20" \
            "All completed orders"

# Step 4: Test Any Orders (Database State)
echo "🗄️ Step 4: Database State Check"
echo "==============================="
make_request "$API_BASE/shop/repair-orders/?limit=10" \
            "Recent orders (any status)"

# Step 5: Test Stats Endpoint (Optional)
echo "📊 Step 5: Stats Endpoint (Optional)"
echo "===================================="
make_request "$API_BASE/shop/repair-orders/stats/" \
            "Repair order statistics"

# Step 6: Test Active Orders (Optional)
echo "🔧 Step 6: Active Orders (Optional)"
echo "==================================="
make_request "$API_BASE/shop/repair-orders/active/" \
            "Active repair orders"

echo "🎯 Test Summary"
echo "=============="
echo "✅ All tests completed"
echo "📋 Results saved above"
echo ""
echo "💡 Next Steps:"
echo "   1. Review the test results above"
echo "   2. Check if today's revenue data exists"
echo "   3. Verify response format matches frontend expectations"
echo "   4. Fill out the Backend Developer Response Template in the documentation"
echo ""

# Calculate revenue if jq is available
if command -v jq >/dev/null 2>&1; then
    echo "🧮 Revenue Calculation Test"
    echo "=========================="
    
    revenue_response=$(curl -s \
        -H "Authorization: Bearer $TOKEN" \
        "$API_BASE/shop/repair-orders/?status=completed&completed_date_after=$TODAY&completed_date_before=$TODAY&limit=100")
    
    # Try different response structures
    revenue_total=0
    
    # Method 1: results array
    if echo "$revenue_response" | jq -e '.results' >/dev/null 2>&1; then
        revenue_total=$(echo "$revenue_response" | jq '[.results[].total // 0] | add // 0')
        order_count=$(echo "$revenue_response" | jq '.results | length')
        echo "📊 Using 'results' array structure"
    # Method 2: repair_orders array  
    elif echo "$revenue_response" | jq -e '.repair_orders' >/dev/null 2>&1; then
        revenue_total=$(echo "$revenue_response" | jq '[.repair_orders[].total // 0] | add // 0')
        order_count=$(echo "$revenue_response" | jq '.repair_orders | length')
        echo "📊 Using 'repair_orders' array structure"
    # Method 3: direct array
    elif echo "$revenue_response" | jq -e '. | type == "array"' >/dev/null 2>&1; then
        revenue_total=$(echo "$revenue_response" | jq '[.[].total // 0] | add // 0')
        order_count=$(echo "$revenue_response" | jq '. | length')
        echo "📊 Using direct array structure"
    else
        echo "❌ Unable to parse response structure for revenue calculation"
        echo "📊 Response: $revenue_response"
    fi
    
    if [ "$revenue_total" != "0" ] || [ "$order_count" != "0" ]; then
        echo "💰 Today's Revenue: \$$revenue_total"
        echo "📦 Orders Completed Today: $order_count"
        echo "✅ Revenue calculation successful"
    else
        echo "💰 Today's Revenue: \$0.00"
        echo "📦 Orders Completed Today: 0"
        echo "ℹ️  This could be correct if no orders were completed today"
    fi
else
    echo "⚠️  jq not available - install jq for automatic revenue calculation"
fi

echo ""
echo "🔗 Additional Testing:"
echo "   - Open http://localhost:5173/revenue-test.html for interactive testing"
echo "   - Check frontend console for detailed API call logs"
echo "   - Verify date/time formats match expectations"
