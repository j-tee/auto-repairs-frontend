#!/bin/bash

# Test Technician API Endpoints with Real Data
echo "🔧 Testing Technician Assignment API Endpoints"
echo "=============================================="

# Configuration - UPDATE THESE VALUES
BASE_URL="http://localhost:8000/api"
TOKEN="YOUR_TOKEN_HERE"  # Replace with actual token

if [ "$TOKEN" = "YOUR_TOKEN_HERE" ]; then
    echo "❌ Error: Please update the TOKEN variable with your actual authentication token"
    exit 1
fi

echo "Base URL: $BASE_URL"
echo "Testing with token: ${TOKEN:0:20}..."
echo ""

# First, let's get some appointment IDs to test with
echo "📋 Step 1: Get Appointments to Test With"
echo "GET $BASE_URL/shop/appointments/"
APPOINTMENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/appointments/?limit=5")

echo "Appointments Response:"
echo "$APPOINTMENTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "Response: $APPOINTMENTS_RESPONSE"

# Extract first appointment ID for testing
APPOINTMENT_ID=$(echo "$APPOINTMENTS_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and len(data) > 0:
        print(data[0].get('id', ''))
    elif isinstance(data, dict) and 'results' in data and len(data['results']) > 0:
        print(data['results'][0].get('id', ''))
    else:
        print('')
except:
    print('')
" 2>/dev/null)

if [ -z "$APPOINTMENT_ID" ]; then
    echo "❌ No appointments found. Please create some test appointments first."
    exit 1
fi

echo ""
echo "Using appointment ID: $APPOINTMENT_ID for testing"
echo ""

# Test 2: Get Technicians
echo "📋 Step 2: Get Available Technicians"
echo "GET $BASE_URL/shop/employees/?role=technician"
TECHNICIANS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/employees/?role=technician")

echo "Technicians Response:"
echo "$TECHNICIANS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "Response: $TECHNICIANS_RESPONSE"

# Extract first technician ID for testing
TECHNICIAN_ID=$(echo "$TECHNICIANS_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and len(data) > 0:
        print(data[0].get('id', ''))
    elif isinstance(data, dict) and 'results' in data and len(data['results']) > 0:
        print(data['results'][0].get('id', ''))
    else:
        print('')
except:
    print('')
" 2>/dev/null)

if [ -z "$TECHNICIAN_ID" ]; then
    echo "❌ No technicians found. Please create some technician employees first."
    exit 1
fi

echo ""
echo "Using technician ID: $TECHNICIAN_ID for testing"
echo ""

# Test 3: Try Assignment Endpoint
echo "📋 Step 3: Test Technician Assignment"
echo "POST $BASE_URL/shop/appointments/$APPOINTMENT_ID/assign-technician/"
ASSIGN_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"technician_id\": $TECHNICIAN_ID}" \
     "$BASE_URL/shop/appointments/$APPOINTMENT_ID/assign-technician/")

ASSIGN_HTTP_CODE=$(echo "$ASSIGN_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
ASSIGN_BODY=$(echo "$ASSIGN_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Assignment Response (HTTP $ASSIGN_HTTP_CODE):"
echo "$ASSIGN_BODY" | python3 -m json.tool 2>/dev/null || echo "Response: $ASSIGN_BODY"
echo ""

# Test 4: Try Start Work Endpoint
echo "📋 Step 4: Test Start Work"
echo "POST $BASE_URL/shop/appointments/$APPOINTMENT_ID/start-work/"
START_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/appointments/$APPOINTMENT_ID/start-work/")

START_HTTP_CODE=$(echo "$START_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
START_BODY=$(echo "$START_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Start Work Response (HTTP $START_HTTP_CODE):"
echo "$START_BODY" | python3 -m json.tool 2>/dev/null || echo "Response: $START_BODY"
echo ""

# Test 5: Try Complete Work Endpoint
echo "📋 Step 5: Test Complete Work"
echo "POST $BASE_URL/shop/appointments/$APPOINTMENT_ID/complete-work/"
COMPLETE_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/appointments/$APPOINTMENT_ID/complete-work/")

COMPLETE_HTTP_CODE=$(echo "$COMPLETE_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
COMPLETE_BODY=$(echo "$COMPLETE_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Complete Work Response (HTTP $COMPLETE_HTTP_CODE):"
echo "$COMPLETE_BODY" | python3 -m json.tool 2>/dev/null || echo "Response: $COMPLETE_BODY"
echo ""

# Test 6: Check Workload Endpoint
echo "📋 Step 6: Test Workload Overview"
echo "GET $BASE_URL/shop/technicians/workload/"
WORKLOAD_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     "$BASE_URL/shop/technicians/workload/")

WORKLOAD_HTTP_CODE=$(echo "$WORKLOAD_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
WORKLOAD_BODY=$(echo "$WORKLOAD_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Workload Response (HTTP $WORKLOAD_HTTP_CODE):"
echo "$WORKLOAD_BODY" | python3 -m json.tool 2>/dev/null || echo "Response: $WORKLOAD_BODY"
echo ""

# Summary
echo "🎯 API Endpoint Test Summary"
echo "================================"
echo "Assignment Endpoint: HTTP $ASSIGN_HTTP_CODE"
echo "Start Work Endpoint: HTTP $START_HTTP_CODE"
echo "Complete Work Endpoint: HTTP $COMPLETE_HTTP_CODE"
echo "Workload Endpoint: HTTP $WORKLOAD_HTTP_CODE"
echo ""

# Analysis
echo "📊 Results Analysis:"
if [ "$ASSIGN_HTTP_CODE" = "200" ] || [ "$ASSIGN_HTTP_CODE" = "201" ]; then
    echo "✅ Assignment endpoint works!"
elif [ "$ASSIGN_HTTP_CODE" = "404" ]; then
    echo "❌ Assignment endpoint not found (404) - Backend needs implementation"
elif [ "$ASSIGN_HTTP_CODE" = "400" ] || [ "$ASSIGN_HTTP_CODE" = "422" ]; then
    echo "⚠️  Assignment endpoint exists but validation failed - Check request format"
else
    echo "⚠️  Assignment endpoint returned HTTP $ASSIGN_HTTP_CODE - Check logs"
fi

if [ "$START_HTTP_CODE" = "200" ] || [ "$START_HTTP_CODE" = "201" ]; then
    echo "✅ Start work endpoint works!"
elif [ "$START_HTTP_CODE" = "404" ]; then
    echo "❌ Start work endpoint not found (404) - Backend needs implementation"
elif [ "$START_HTTP_CODE" = "400" ] || [ "$START_HTTP_CODE" = "422" ]; then
    echo "⚠️  Start work endpoint exists but validation failed - Check appointment status"
else
    echo "⚠️  Start work endpoint returned HTTP $START_HTTP_CODE - Check logs"
fi

if [ "$COMPLETE_HTTP_CODE" = "200" ] || [ "$COMPLETE_HTTP_CODE" = "201" ]; then
    echo "✅ Complete work endpoint works!"
elif [ "$COMPLETE_HTTP_CODE" = "404" ]; then
    echo "❌ Complete work endpoint not found (404) - Backend needs implementation"
elif [ "$COMPLETE_HTTP_CODE" = "400" ] || [ "$COMPLETE_HTTP_CODE" = "422" ]; then
    echo "⚠️  Complete work endpoint exists but validation failed - Check appointment status"
else
    echo "⚠️  Complete work endpoint returned HTTP $COMPLETE_HTTP_CODE - Check logs"
fi

if [ "$WORKLOAD_HTTP_CODE" = "200" ]; then
    echo "✅ Workload endpoint works!"
elif [ "$WORKLOAD_HTTP_CODE" = "404" ]; then
    echo "❌ Workload endpoint not found (404) - Backend needs implementation"
else
    echo "⚠️  Workload endpoint returned HTTP $WORKLOAD_HTTP_CODE - Check logs"
fi

echo ""
echo "📋 Next Steps:"
echo "1. If endpoints return 404: Backend developer needs to implement missing endpoints"
echo "2. If endpoints return 400/422: Check appointment status workflow in database"
echo "3. If endpoints return 500: Check backend logs for errors"
echo "4. Update frontend to handle proper ID types (string vs number)"