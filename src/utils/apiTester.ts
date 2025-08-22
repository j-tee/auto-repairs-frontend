import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Types for test results
interface EndpointTest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  category: string;
}

interface TestResult {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  timestamp: string;
  endpoint: EndpointTest;
  error?: string;
}

interface TestSummary {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  authRequiredTests: number;
  categories: string[];
  results: TestResult[];
}

// Sample data for POST/PUT requests
const sampleData = {
  customer: {
    name: "Test Customer API",
    email: "test.api@example.com",
    phone: "555-123-4567",
    address: "123 API Test Street"
  },
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: 2022,
    vin: "1234567890ABCDEFG",
    license_plate: "API123",
    customer: 1,
    mileage: 50000,
    color: "Blue"
  },
  appointment: {
    customer: 1,
    vehicle: 1,
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    description: "API Test Appointment - Oil change and inspection",
    status: "scheduled",
    notes: "Created via API test"
  },
  'repair-order': {
    customer: 1,
    vehicle: 1,
    description: "API Test Repair Order - Brake pad replacement",
    status: "pending",
    estimated_cost: "250.00",
    notes: "Test repair order created via API",
    priority: "medium"
  },
  employee: {
    user: 1,
    position: "Senior Mechanic",
    hire_date: new Date().toISOString().split('T')[0],
    salary: "65000.00",
    department: "Service"
  },
  shop: {
    name: "API Test Auto Shop",
    address: "456 Test Shop Boulevard",
    phone: "555-987-6543",
    email: "testshop@example.com",
    hours: "Mon-Fri 8AM-6PM"
  },
  user: {
    email: "apitest@example.com",
    password: "TestPassword123!",
    first_name: "API",
    last_name: "Tester",
    role: "customer"
  }
};

// Define all endpoints to test
const endpointsToTest: EndpointTest[] = [
  // Authentication endpoints
  { method: 'POST', path: '/token/', description: 'JWT Token Login', requiresAuth: false, category: 'auth' },
  { method: 'POST', path: '/token/refresh/', description: 'Refresh JWT Token', requiresAuth: false, category: 'auth' },
  { method: 'POST', path: '/auth/register/', description: 'User Registration', requiresAuth: false, category: 'auth' },
  { method: 'GET', path: '/auth/user/', description: 'Get User Profile', requiresAuth: true, category: 'auth' },
  { method: 'PUT', path: '/auth/user/update/', description: 'Update User Profile', requiresAuth: true, category: 'auth' },
  
  // Admin endpoints
  { method: 'GET', path: '/admin/users/', description: 'List All Users (Admin)', requiresAuth: true, category: 'admin' },
  
  // Shop - Customers
  { method: 'GET', path: '/shop/customers/', description: 'List Customers', requiresAuth: true, category: 'customers' },
  { method: 'POST', path: '/shop/customers/', description: 'Create Customer', requiresAuth: true, category: 'customers' },
  { method: 'GET', path: '/shop/customers/1/', description: 'Get Customer Details', requiresAuth: true, category: 'customers' },
  { method: 'PUT', path: '/shop/customers/1/', description: 'Update Customer', requiresAuth: true, category: 'customers' },
  { method: 'DELETE', path: '/shop/customers/1/', description: 'Delete Customer', requiresAuth: true, category: 'customers' },
  
  // Shop - Vehicles
  { method: 'GET', path: '/shop/vehicles/', description: 'List Vehicles', requiresAuth: true, category: 'vehicles' },
  { method: 'POST', path: '/shop/vehicles/', description: 'Create Vehicle', requiresAuth: true, category: 'vehicles' },
  { method: 'GET', path: '/shop/vehicles/1/', description: 'Get Vehicle Details', requiresAuth: true, category: 'vehicles' },
  { method: 'PUT', path: '/shop/vehicles/1/', description: 'Update Vehicle', requiresAuth: true, category: 'vehicles' },
  { method: 'DELETE', path: '/shop/vehicles/1/', description: 'Delete Vehicle', requiresAuth: true, category: 'vehicles' },
  
  // Shop - Appointments
  { method: 'GET', path: '/shop/appointments/', description: 'List Appointments', requiresAuth: true, category: 'appointments' },
  { method: 'POST', path: '/shop/appointments/', description: 'Create Appointment', requiresAuth: true, category: 'appointments' },
  { method: 'GET', path: '/shop/appointments/1/', description: 'Get Appointment Details', requiresAuth: true, category: 'appointments' },
  { method: 'PUT', path: '/shop/appointments/1/', description: 'Update Appointment', requiresAuth: true, category: 'appointments' },
  { method: 'DELETE', path: '/shop/appointments/1/', description: 'Delete Appointment', requiresAuth: true, category: 'appointments' },
  
  // Shop - Repair Orders
  { method: 'GET', path: '/shop/repair-orders/', description: 'List Repair Orders', requiresAuth: true, category: 'repair-orders' },
  { method: 'POST', path: '/shop/repair-orders/', description: 'Create Repair Order', requiresAuth: true, category: 'repair-orders' },
  { method: 'GET', path: '/shop/repair-orders/1/', description: 'Get Repair Order Details', requiresAuth: true, category: 'repair-orders' },
  { method: 'PUT', path: '/shop/repair-orders/1/', description: 'Update Repair Order', requiresAuth: true, category: 'repair-orders' },
  { method: 'DELETE', path: '/shop/repair-orders/1/', description: 'Delete Repair Order', requiresAuth: true, category: 'repair-orders' },
  
  // Shop - Employees
  { method: 'GET', path: '/shop/employees/', description: 'List Employees', requiresAuth: true, category: 'employees' },
  { method: 'POST', path: '/shop/employees/', description: 'Create Employee', requiresAuth: true, category: 'employees' },
  { method: 'GET', path: '/shop/employees/1/', description: 'Get Employee Details', requiresAuth: true, category: 'employees' },
  { method: 'PUT', path: '/shop/employees/1/', description: 'Update Employee', requiresAuth: true, category: 'employees' },
  { method: 'DELETE', path: '/shop/employees/1/', description: 'Delete Employee', requiresAuth: true, category: 'employees' },
  
  // Shop - Shops
  { method: 'GET', path: '/shop/shops/', description: 'List Shops', requiresAuth: true, category: 'shops' },
  { method: 'POST', path: '/shop/shops/', description: 'Create Shop', requiresAuth: true, category: 'shops' },
  { method: 'GET', path: '/shop/shops/1/', description: 'Get Shop Details', requiresAuth: true, category: 'shops' },
  { method: 'PUT', path: '/shop/shops/1/', description: 'Update Shop', requiresAuth: true, category: 'shops' },
  { method: 'DELETE', path: '/shop/shops/1/', description: 'Delete Shop', requiresAuth: true, category: 'shops' }
];

/**
 * Test a single API endpoint
 */
async function testEndpoint(endpoint: EndpointTest): Promise<TestResult> {
  try {
    let response: any;
    const entityType = getEntityTypeFromPath(endpoint.path);
    const testData = sampleData[entityType as keyof typeof sampleData];
    
    switch (endpoint.method) {
      case 'GET':
        response = await apiGet(endpoint.path);
        break;
      case 'POST':
        response = await apiPost(endpoint.path, testData || { test: true });
        break;
      case 'PUT':
        response = await apiPut(endpoint.path, testData || { test: true });
        break;
      case 'DELETE':
        response = await apiDelete(endpoint.path);
        break;
    }
    
    return {
      success: true,
      status: 200, // API utilities handle errors, so if we get here it's success
      statusText: 'OK',
      data: response,
      timestamp: new Date().toISOString(),
      endpoint
    };
    
  } catch (error: any) {
    return {
      success: false,
      status: error.status || 0,
      statusText: error.statusText || 'Unknown Error',
      data: error.response?.data || error.message,
      timestamp: new Date().toISOString(),
      endpoint,
      error: error.message
    };
  }
}

/**
 * Extract entity type from API path
 */
function getEntityTypeFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return segments[1]; // e.g., '/shop/customers/' -> 'customers'
  }
  return 'unknown';
}

/**
 * Test multiple endpoints by category
 */
async function testEndpointsByCategory(category: string, onProgress?: (result: TestResult) => void): Promise<TestResult[]> {
  const categoryEndpoints = endpointsToTest.filter(ep => ep.category === category);
  const results: TestResult[] = [];
  
  for (const endpoint of categoryEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (onProgress) {
      onProgress(result);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Test all API endpoints
 */
async function testAllEndpoints(onProgress?: (result: TestResult) => void): Promise<TestSummary> {
  const results: TestResult[] = [];
  
  for (const endpoint of endpointsToTest) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (onProgress) {
      onProgress(result);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return generateTestSummary(results);
}

/**
 * Test only authentication endpoints
 */
async function testAuthEndpoints(onProgress?: (result: TestResult) => void): Promise<TestResult[]> {
  return testEndpointsByCategory('auth', onProgress);
}

/**
 * Test only shop-related endpoints
 */
async function testShopEndpoints(onProgress?: (result: TestResult) => void): Promise<TestResult[]> {
  const shopCategories = ['customers', 'vehicles', 'appointments', 'repair-orders', 'employees', 'shops'];
  const results: TestResult[] = [];
  
  for (const category of shopCategories) {
    const categoryResults = await testEndpointsByCategory(category, onProgress);
    results.push(...categoryResults);
  }
  
  return results;
}

/**
 * Generate test summary from results
 */
function generateTestSummary(results: TestResult[]): TestSummary {
  const categories = [...new Set(results.map(r => r.endpoint.category))];
  
  return {
    totalTests: results.length,
    successfulTests: results.filter(r => r.success).length,
    failedTests: results.filter(r => !r.success).length,
    authRequiredTests: results.filter(r => r.endpoint.requiresAuth).length,
    categories,
    results
  };
}

/**
 * Generate a detailed test report
 */
function generateTestReport(summary: TestSummary): string {
  let report = `# API Endpoint Test Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  // Summary
  report += `## Summary\n\n`;
  report += `- **Total Tests:** ${summary.totalTests}\n`;
  report += `- **Successful:** ${summary.successfulTests} (${Math.round(summary.successfulTests / summary.totalTests * 100)}%)\n`;
  report += `- **Failed:** ${summary.failedTests} (${Math.round(summary.failedTests / summary.totalTests * 100)}%)\n`;
  report += `- **Auth Required:** ${summary.authRequiredTests}\n`;
  report += `- **Categories:** ${summary.categories.join(', ')}\n\n`;
  
  // Results by category
  for (const category of summary.categories) {
    const categoryResults = summary.results.filter(r => r.endpoint.category === category);
    const successCount = categoryResults.filter(r => r.success).length;
    
    report += `## ${category.toUpperCase()} Endpoints (${successCount}/${categoryResults.length} successful)\n\n`;
    
    for (const result of categoryResults) {
      const status = result.success ? '✅' : '❌';
      report += `### ${status} ${result.endpoint.method} ${result.endpoint.path}\n`;
      report += `**Description:** ${result.endpoint.description}\n`;
      report += `**Status:** HTTP ${result.status} ${result.statusText}\n`;
      report += `**Timestamp:** ${result.timestamp}\n`;
      
      if (!result.success && result.error) {
        report += `**Error:** ${result.error}\n`;
      }
      
      if (result.data && typeof result.data === 'object') {
        const dataPreview = JSON.stringify(result.data, null, 2);
        if (dataPreview.length > 500) {
          report += `**Response:** ${dataPreview.substring(0, 500)}...\n`;
        } else {
          report += `**Response:** ${dataPreview}\n`;
        }
      }
      
      report += `\n`;
    }
  }
  
  return report;
}

/**
 * Export test results to JSON
 */
function exportTestResults(summary: TestSummary): void {
  const dataStr = JSON.stringify(summary, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `api-test-results-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

/**
 * Export test report to markdown
 */
function exportTestReport(summary: TestSummary): void {
  const report = generateTestReport(summary);
  const dataBlob = new Blob([report], { type: 'text/markdown' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `api-test-report-${new Date().toISOString().split('T')[0]}.md`;
  link.click();
}

// Export the testing utilities
export {
  testEndpoint,
  testAllEndpoints,
  testAuthEndpoints,
  testShopEndpoints,
  testEndpointsByCategory,
  generateTestSummary,
  generateTestReport,
  exportTestResults,
  exportTestReport,
  endpointsToTest,
  type EndpointTest,
  type TestResult,
  type TestSummary
};

// Console-friendly testing functions for development
export const apiTester = {
  testAll: testAllEndpoints,
  testAuth: testAuthEndpoints,
  testShop: testShopEndpoints,
  testCategory: testEndpointsByCategory,
  testSingle: testEndpoint,
  endpoints: endpointsToTest,
  
  // Quick test function for console use
  async quickTest() {
    console.log('🚀 Starting API endpoint tests...');
    const summary = await testAllEndpoints((result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.endpoint.method} ${result.endpoint.path} - ${result.statusText}`);
    });
    
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${summary.totalTests}, Success: ${summary.successfulTests}, Failed: ${summary.failedTests}`);
    console.log(`Success Rate: ${Math.round(summary.successfulTests / summary.totalTests * 100)}%`);
    
    return summary;
  }
};

// Make it available globally for console use
if (typeof window !== 'undefined') {
  (window as any).apiTester = apiTester;
}
