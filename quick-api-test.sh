#!/bin/bash

# Quick API Test Script - Test appointments and technician data
echo "🔍 Testing Appointment and Technician Data"
echo "=========================================="

# Check if we can get appointments (might need auth token)
echo "1. Testing appointments endpoint..."
APPOINTMENTS_RESPONSE=$(curl -s http://localhost:8000/api/shop/appointments/ || echo "FAILED")
echo "Response: $APPOINTMENTS_RESPONSE"
echo ""

# Check if we can get employees
echo "2. Testing employees endpoint..."
EMPLOYEES_RESPONSE=$(curl -s http://localhost:8000/api/shop/employees/ || echo "FAILED")  
echo "Response: $EMPLOYEES_RESPONSE"
echo ""

# Check technician workload endpoint (the one we expect to be missing)
echo "3. Testing technician workload endpoint..."
WORKLOAD_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/api/shop/technicians/workload/ || echo "FAILED")
echo "Response: $WORKLOAD_RESPONSE"
echo ""

# Check if technician assignment endpoints exist
echo "4. Testing technician assignment endpoints..."
echo "Testing assign-technician endpoint..."
ASSIGN_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/shop/appointments/1/assign-technician/ || echo "FAILED")
echo "Response: $ASSIGN_RESPONSE"
echo ""

echo "5. Testing start-work endpoint..."
START_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/shop/appointments/1/start-work/ || echo "FAILED")
echo "Response: $START_RESPONSE"
echo ""

echo "6. Testing complete-work endpoint..."
COMPLETE_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/shop/appointments/1/complete-work/ || echo "FAILED")
echo "Response: $COMPLETE_RESPONSE"
echo ""

echo "Summary:"
echo "- If you see 401 errors, we need authentication tokens"
echo "- If you see 404 errors, the endpoints don't exist"
echo "- If you see other responses, the endpoints exist but may have validation issues"