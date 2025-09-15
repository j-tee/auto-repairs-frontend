#!/bin/bash

# Technician API Endpoint Testing Script
# Run this script to test the critical endpoints mentioned in backend documentation

echo "🔧 Testing Technician Management API Endpoints"
echo "============================================="

# Configuration
BASE_URL="http://localhost:8000/api"
TOKEN="" # Add your token here

if [ -z "$TOKEN" ]; then
    echo "❌ Error: Please set your authentication token in this script"
    echo "   Edit the TOKEN variable at the top of this file"
    exit 1
fi

echo "Base URL: $BASE_URL"
echo "Token: ${TOKEN:0:20}..." # Show first 20 chars only
echo ""

# Test 1: Get all employees
echo "📋 Test 1: Get All Employees"
echo "GET $BASE_URL/shop/employees/"
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/employees/" | python3 -m json.tool 2>/dev/null || echo "❌ Failed or invalid JSON response"
echo ""

# Test 2: Get technicians only
echo "📋 Test 2: Get Technicians (role=technician)"
echo "GET $BASE_URL/shop/employees/?role=technician"
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/employees/?role=technician" | python3 -m json.tool 2>/dev/null || echo "❌ Failed or invalid JSON response"
echo ""

# Test 3: Get available technicians
echo "📋 Test 3: Get Available Technicians"
echo "GET $BASE_URL/shop/employees/?role=technician&is_available=true"
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/employees/?role=technician&is_available=true" | python3 -m json.tool 2>/dev/null || echo "❌ Failed or invalid JSON response"
echo ""

# Test 4: Get technician workload (CRITICAL - may not exist)
echo "📋 Test 4: Get Technician Workload Overview (CRITICAL)"
echo "GET $BASE_URL/shop/technicians/workload/"
WORKLOAD_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/technicians/workload/")

HTTP_CODE=$(echo "$WORKLOAD_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$WORKLOAD_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Workload endpoint exists!"
    echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "Response: $RESPONSE_BODY"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ CRITICAL: Workload endpoint not found (404)"
    echo "   Backend needs to implement: GET /api/shop/technicians/workload/"
else
    echo "⚠️  Unexpected response code: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
fi
echo ""

# Test 5: Get appointments (for context)
echo "📋 Test 5: Get Appointments (for assignment context)"
echo "GET $BASE_URL/shop/appointments/ (first 3 only)"
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/appointments/?limit=3" | python3 -m json.tool 2>/dev/null || echo "❌ Failed or invalid JSON response"
echo ""

# Test 6: Test assignment endpoints (requires appointment ID)
echo "📋 Test 6: Assignment Endpoint Structure Test"
echo "Testing if assignment endpoints exist (will show 400/422 if they exist, 404 if not)"

# Try with a dummy ID to see if endpoints exist
TEST_APPOINTMENT_ID=1
TEST_TECHNICIAN_ID=1

echo "POST $BASE_URL/shop/appointments/$TEST_APPOINTMENT_ID/assign-technician/"
ASSIGN_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"technician_id\": $TEST_TECHNICIAN_ID}" \
     "$BASE_URL/shop/appointments/$TEST_APPOINTMENT_ID/assign-technician/")

ASSIGN_HTTP_CODE=$(echo "$ASSIGN_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
ASSIGN_BODY=$(echo "$ASSIGN_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

if [ "$ASSIGN_HTTP_CODE" = "404" ]; then
    echo "❌ Assignment endpoint not found (404)"
elif [ "$ASSIGN_HTTP_CODE" = "400" ] || [ "$ASSIGN_HTTP_CODE" = "422" ] || [ "$ASSIGN_HTTP_CODE" = "200" ]; then
    echo "✅ Assignment endpoint exists! (HTTP $ASSIGN_HTTP_CODE)"
    echo "   Response: $ASSIGN_BODY"
else
    echo "⚠️  Unexpected assignment response: $ASSIGN_HTTP_CODE"
    echo "   Response: $ASSIGN_BODY"
fi

echo ""
echo "🎯 Testing Complete!"
echo "============================================="
echo "Summary:"
echo "1. Employee endpoint: Test manually above"
echo "2. Technician filtering: Test manually above"  
echo "3. Available technicians: Test manually above"
echo "4. Workload endpoint: Check result above"
echo "5. Assignment endpoints: Check result above"
echo ""
echo "Next Steps:"
echo "- If workload endpoint returns 404: Backend needs implementation"
echo "- If assignment endpoints return 404: Backend needs implementation"
echo "- Copy any successful responses to analyze data structure"
echo "- Update frontend types based on actual API responses"