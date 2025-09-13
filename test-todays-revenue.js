#!/usr/bin/env node

// Check if axios is available, if not use fetch
let httpClient;
try {
  httpClient = require('axios');
} catch (e) {
  // Use Node.js built-in fetch (Node 18+) or fall back to manual request
  console.log('Axios not found, using fetch...');
}

async function makeRequest(url, params = {}) {
  const fullUrl = new URL(url);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      fullUrl.searchParams.append(key, params[key]);
    }
  });
  
  console.log(`🌐 Making request to: ${fullUrl.toString()}`);
  
  if (httpClient) {
    // Use axios
    const response = await httpClient.get(url, { params, timeout: 10000 });
    return {
      status: response.status,
      data: response.data
    };
  } else {
    // Use fetch
    const response = await fetch(fullUrl.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      status: response.status,
      data: data
    };
  }
}

async function testTodaysRevenue() {
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  console.log(`🗓️ Testing revenue for today: ${today}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Try to get completed repair orders for today
    console.log('\n📊 Test 1: Getting completed repair orders for today...');
    try {
      const response1 = await makeRequest(`${API_BASE_URL}/shop/repair-orders/`, {
        status: 'completed',
        completed_date_after: today,
        completed_date_before: today,
        limit: 100
      });
      
      console.log(`✅ Response status: ${response1.status}`);
      console.log(`📋 Response structure:`, Object.keys(response1.data));
      
      const orders = response1.data.results || response1.data.repair_orders || response1.data || [];
      console.log(`🔢 Number of completed orders today: ${orders.length}`);
      
      if (orders.length > 0) {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        console.log(`💰 Total revenue from completed orders today: $${totalRevenue}`);
        
        orders.forEach((order, index) => {
          console.log(`  Order ${index + 1}: ID=${order.id}, Total=$${order.total || 0}, Status=${order.status}`);
        });
      } else {
        console.log('📭 No completed orders found for today');
      }
      
    } catch (error1) {
      console.log(`❌ Test 1 failed: ${error1.message}`);
    }
    
    // Test 2: Try alternative approach - get all completed orders and filter
    console.log('\n📊 Test 2: Getting all completed orders (fallback method)...');
    try {
      const response2 = await makeRequest(`${API_BASE_URL}/shop/repair-orders/`, {
        status: 'completed',
        limit: 100
      });
      
      console.log(`✅ Response status: ${response2.status}`);
      const allCompletedOrders = response2.data.results || response2.data.repair_orders || response2.data || [];
      console.log(`📋 Total completed orders: ${allCompletedOrders.length}`);
      
      // Filter for today's orders client-side
      const todaysOrders = allCompletedOrders.filter(order => {
        const completedDate = order.actual_completion_date || order.completed_at || order.updated_at;
        return completedDate && completedDate.startsWith(today);
      });
      
      console.log(`🔢 Orders completed today (client-side filter): ${todaysOrders.length}`);
      
      if (todaysOrders.length > 0) {
        const totalRevenue = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        console.log(`💰 Total revenue from today's completed orders: $${totalRevenue}`);
        
        todaysOrders.forEach((order, index) => {
          const completedDate = order.actual_completion_date || order.completed_at || order.updated_at;
          console.log(`  Order ${index + 1}: ID=${order.id}, Total=$${order.total || 0}, Completed=${completedDate}`);
        });
      } else {
        console.log('📭 No orders completed today found in client-side filtering');
      }
      
    } catch (error2) {
      console.log(`❌ Test 2 failed: ${error2.message}`);
    }
    
    // Test 3: Try to get any orders at all to see what's in the database
    console.log('\n📊 Test 3: Getting all repair orders to check database contents...');
    try {
      const response3 = await makeRequest(`${API_BASE_URL}/shop/repair-orders/`, {
        limit: 10
      });
      
      console.log(`✅ Response status: ${response3.status}`);
      const allOrders = response3.data.results || response3.data.repair_orders || response3.data || [];
      console.log(`📋 Total orders in database: ${allOrders.length}`);
      
      if (allOrders.length > 0) {
        console.log(`🔍 Sample order structure:`, Object.keys(allOrders[0]));
        
        allOrders.forEach((order, index) => {
          const createdDate = order.created_at ? order.created_at.split('T')[0] : 'Unknown';
          const completedDate = order.actual_completion_date || order.completed_at || 'Not completed';
          console.log(`  Order ${index + 1}: ID=${order.id}, Status=${order.status}, Total=$${order.total || 0}, Created=${createdDate}, Completed=${completedDate}`);
        });
        
        // Check if any orders exist for today (any status)
        const todaysAllOrders = allOrders.filter(order => {
          const createdDate = order.created_at ? order.created_at.split('T')[0] : null;
          return createdDate === today;
        });
        
        console.log(`📅 Orders created today (any status): ${todaysAllOrders.length}`);
        
      } else {
        console.log('📭 No orders found in database at all');
      }
      
    } catch (error3) {
      console.log(`❌ Test 3 failed: ${error3.message}`);
    }
    
    // Test 4: Check if we have any revenue data from stats endpoint
    console.log('\n📊 Test 4: Checking repair order stats endpoint...');
    try {
      const response4 = await makeRequest(`${API_BASE_URL}/shop/repair-orders/stats/`);
      
      console.log(`✅ Stats response status: ${response4.status}`);
      console.log(`📊 Stats data:`, response4.data);
      
    } catch (error4) {
      console.log(`❌ Test 4 failed: ${error4.message}`);
    }
    
  } catch (globalError) {
    console.error('❌ Global error:', globalError.message);
  }
}

// Run the test
testTodaysRevenue().catch(console.error);
