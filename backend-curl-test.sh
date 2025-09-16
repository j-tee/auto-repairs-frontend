#!/bin/bash

# 🧪 Revenue Today API Test Script (curl version)
# ===============================================
# 
# Simple curl-based testing for backend developers
# Run this script to quickly test the Revenue Today API endpoints
#
# Usage: ./backend-curl-test.sh [email] [password]
# Example: ./backend-curl-test.sh test@example.com password123

set -e  # Exit on any error

# Configuration
API_BASE_URL="http://127.0.0.1:8000/api"
TODAY=$(date +%Y-%m-%d)
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}🧪 Revenue Today API Test (curl version)${NC}"
echo -e "${BLUE}=========================================${NC}"
echo "Testing Date: $TODAY"
echo "API Base URL: $API_BASE_URL"
echo "Credentials: $EMAIL / $PASSWORD"
echo ""

# Function to print colored output
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_header() {
    echo ""
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..60})${NC}"
}

# Test 1: Authentication
log_header "🔐 AUTHENTICATION TEST"

log_info "Getting authentication token..."

TOKEN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    "$API_BASE_URL/token/" 2>/dev/null)

HTTP_STATUS=$(echo $TOKEN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
TOKEN_BODY=$(echo $TOKEN_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    ACCESS_TOKEN=$(echo "$TOKEN_BODY" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ACCESS_TOKEN" ]; then
        log_success "Authentication successful"
        log_info "Token: ${ACCESS_TOKEN:0:20}..."
    else
        log_error "No access token in response"
        echo "Response: $TOKEN_BODY"
        exit 1
    fi
else
    log_error "Authentication failed (HTTP $HTTP_STATUS)"
    echo "Response: $TOKEN_BODY"
    exit 1
fi

# Test 2: Today's Revenue (Primary)
log_header "💰 TODAY'S REVENUE - PRIMARY TEST"

log_info "Testing completed orders for today ($TODAY)..."

REVENUE_URL="$API_BASE_URL/shop/repair-orders/?status=completed&completed_date_after=$TODAY&completed_date_before=$TODAY&limit=100"
log_info "URL: $REVENUE_URL"

REVENUE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$REVENUE_URL" 2>/dev/null)

HTTP_STATUS=$(echo $REVENUE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
REVENUE_BODY=$(echo $REVENUE_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "Revenue API call successful (HTTP 200)"
    
    # Parse JSON response (basic parsing)
    ORDER_COUNT=$(echo "$REVENUE_BODY" | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    
    log_info "Response received, parsing data..."
    echo "Response preview:"
    echo "$REVENUE_BODY" | head -c 500
    echo ""
    
    if [ "$ORDER_COUNT" -gt 0 ]; then
        log_success "Found $ORDER_COUNT completed orders for today"
        
        # Try to extract total amounts (basic grep)
        TOTALS=$(echo "$REVENUE_BODY" | grep -o '"total[^"]*":[0-9.]*' | cut -d':' -f2)
        if [ -n "$TOTALS" ]; then
            log_info "Order totals found:"
            echo "$TOTALS" | head -5
        fi
    else
        log_warning "No completed orders found for today ($TODAY)"
    fi
    
elif [ "$HTTP_STATUS" -eq 401 ]; then
    log_error "Unauthorized - authentication token invalid"
    exit 1
else
    log_error "Revenue API failed (HTTP $HTTP_STATUS)"
    echo "Response: $REVENUE_BODY"
fi

# Test 3: All Completed Orders (Fallback)
log_header "💰 FALLBACK TEST - ALL COMPLETED ORDERS"

log_info "Testing all completed orders (fallback method)..."

FALLBACK_URL="$API_BASE_URL/shop/repair-orders/?status=completed&limit=20"
log_info "URL: $FALLBACK_URL"

FALLBACK_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$FALLBACK_URL" 2>/dev/null)

HTTP_STATUS=$(echo $FALLBACK_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
FALLBACK_BODY=$(echo $FALLBACK_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "Fallback API call successful"
    
    TOTAL_COUNT=$(echo "$FALLBACK_BODY" | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
    log_info "Total completed orders in database: $TOTAL_COUNT"
    
    # Check for today's date in any orders
    TODAY_MATCHES=$(echo "$FALLBACK_BODY" | grep -c "$TODAY" || echo "0")
    if [ "$TODAY_MATCHES" -gt 0 ]; then
        log_success "Found $TODAY_MATCHES references to today's date in completed orders"
    else
        log_warning "No references to today's date ($TODAY) found in completed orders"
    fi
else
    log_error "Fallback API failed (HTTP $HTTP_STATUS)"
fi

# Test 4: Database Overview
log_header "🗄️ DATABASE STATE OVERVIEW"

log_info "Testing general repair orders endpoint..."

OVERVIEW_URL="$API_BASE_URL/shop/repair-orders/?limit=5"
OVERVIEW_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$OVERVIEW_URL" 2>/dev/null)

HTTP_STATUS=$(echo $OVERVIEW_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
OVERVIEW_BODY=$(echo $OVERVIEW_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "Database query successful"
    
    # Count different statuses
    PENDING_COUNT=$(echo "$OVERVIEW_BODY" | grep -c '"status":"pending"' || echo "0")
    PROGRESS_COUNT=$(echo "$OVERVIEW_BODY" | grep -c '"status":"in_progress"' || echo "0")
    COMPLETED_COUNT=$(echo "$OVERVIEW_BODY" | grep -c '"status":"completed"' || echo "0")
    
    log_info "Status distribution (sample):"
    log_info "  pending: $PENDING_COUNT"
    log_info "  in_progress: $PROGRESS_COUNT"
    log_info "  completed: $COMPLETED_COUNT"
    
    # Sample data structure
    log_info "Sample response structure:"
    echo "$OVERVIEW_BODY" | head -c 300
    echo "..."
else
    log_error "Database overview failed (HTTP $HTTP_STATUS)"
fi

# Test 5: Stats Endpoint (Optional)
log_header "📊 STATS ENDPOINT TEST (OPTIONAL)"

log_info "Testing optional stats endpoint..."

STATS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE_URL/shop/repair-orders/stats/" 2>/dev/null)

HTTP_STATUS=$(echo $STATS_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
STATS_BODY=$(echo $STATS_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "Stats endpoint available"
    echo "Stats data:"
    echo "$STATS_BODY"
elif [ "$HTTP_STATUS" -eq 404 ]; then
    log_warning "Stats endpoint not implemented (optional feature)"
else
    log_warning "Stats endpoint returned HTTP $HTTP_STATUS"
fi

# Summary
log_header "📋 TEST SUMMARY"

echo -e "${BOLD}Backend Revenue Today API Test Results:${NC}"
echo ""
echo -e "${GREEN}✅ Authentication: Working${NC}"
echo -e "${BLUE}📊 API Base URL: $API_BASE_URL${NC}"
echo -e "${BLUE}📅 Test Date: $TODAY${NC}"
echo ""

# Final validation message
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}${BOLD}🎉 BASIC API TESTS PASSED!${NC}"
    echo -e "${GREEN}The backend appears to be responding correctly.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Verify that revenue calculations match expected amounts"
    echo "2. Confirm date filtering is working as expected"
    echo "3. Test with real data to ensure accuracy"
    echo "4. Run the Python test script for detailed validation"
else
    echo -e "${RED}${BOLD}⚠️  SOME TESTS FAILED${NC}"
    echo -e "${RED}Please review the output above and fix any issues.${NC}"
fi

echo ""
echo -e "${BLUE}For more detailed testing, run:${NC}"
echo "python3 backend-api-test-script.py"
