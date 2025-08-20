/**
 * Customer Data Investigation Tool
 * This tool helps debug why customer information is missing from vehicle data
 */

import { apiClient } from '../utils/api';

export class CustomerDataInvestigator {
  private baseURL = '/shop';

  /**
   * Test different vehicle API configurations to see what customer data is available
   */
  async investigateCustomerData(): Promise<void> {
    console.log('🕵️ CustomerDataInvestigator: Starting investigation...');

    try {
      // Test 1: Basic vehicle search
      console.log('\n📋 Test 1: Basic vehicle search for "toyota"');
      const basicResponse = await apiClient.get(`${this.baseURL}/vehicles/?search=toyota`);
      this.logVehicleData('Basic Search', basicResponse.data);

      // Test 2: Vehicle search with expand parameter
      console.log('\n📋 Test 2: Vehicle search with expand=customer');
      try {
        const expandResponse = await apiClient.get(`${this.baseURL}/vehicles/?search=toyota&expand=customer`);
        this.logVehicleData('Expand Customer', expandResponse.data);
      } catch (error) {
        console.log('❌ Expand parameter not supported:', error);
      }

      // Test 3: Get all vehicles without search
      console.log('\n📋 Test 3: Get all vehicles (no search filter)');
      const allVehiclesResponse = await apiClient.get(`${this.baseURL}/vehicles/`);
      this.logVehicleData('All Vehicles', allVehiclesResponse.data);

      // Test 4: Get specific vehicle by ID (if we have one)
      if (basicResponse.data && basicResponse.data.length > 0) {
        const vehicleId = basicResponse.data[0].id;
        console.log(`\n📋 Test 4: Get specific vehicle by ID: ${vehicleId}`);
        try {
          const specificResponse = await apiClient.get(`${this.baseURL}/vehicles/${vehicleId}/`);
          this.logVehicleData('Specific Vehicle', [specificResponse.data]);
        } catch (error) {
          console.log('❌ Failed to get specific vehicle:', error);
        }
      }

      // Test 5: Get customers to see their data structure
      console.log('\n📋 Test 5: Get customers for comparison');
      const customersResponse = await apiClient.get(`${this.baseURL}/customers/`);
      this.logCustomerData('All Customers', customersResponse.data);

    } catch (error) {
      console.error('🕵️ Investigation failed:', error);
    }
  }

  /**
   * Log vehicle data with customer information analysis
   */
  private logVehicleData(testName: string, vehicles: any[]): void {
    console.log(`\n🚗 ${testName} Results:`);
    console.log(`   Vehicle count: ${vehicles?.length || 0}`);
    
    if (!vehicles || vehicles.length === 0) {
      console.log('   No vehicles found');
      return;
    }

    vehicles.forEach((vehicle, index) => {
      console.log(`\n   Vehicle ${index + 1}:`);
      console.log(`     ID: ${vehicle.id}`);
      console.log(`     Make/Model: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      console.log(`     Customer ID: ${vehicle.customer}`);
      console.log(`     Customer Name: ${vehicle.customer_name || 'NOT PROVIDED'}`);
      console.log(`     Customer Email: ${vehicle.customer_email || 'NOT PROVIDED'}`);
      console.log(`     Customer Phone: ${vehicle.customer_phone || 'NOT PROVIDED'}`);
      
      // Check if customer is an object vs ID
      if (typeof vehicle.customer === 'object' && vehicle.customer !== null) {
        console.log(`     Customer Object:`, vehicle.customer);
      }
      
      // List all fields that start with 'customer'
      const customerFields = Object.keys(vehicle).filter(key => key.startsWith('customer'));
      console.log(`     Customer-related fields: [${customerFields.join(', ')}]`);
    });
  }

  /**
   * Log customer data for comparison
   */
  private logCustomerData(testName: string, customers: any[]): void {
    console.log(`\n👤 ${testName} Results:`);
    console.log(`   Customer count: ${customers?.length || 0}`);
    
    if (!customers || customers.length === 0) {
      console.log('   No customers found');
      return;
    }

    // Show first few customers
    customers.slice(0, 3).forEach((customer, index) => {
      console.log(`\n   Customer ${index + 1}:`);
      console.log(`     ID: ${customer.id}`);
      console.log(`     Name: ${customer.name}`);
      console.log(`     Email: ${customer.email || 'NOT PROVIDED'}`);
      console.log(`     Phone: ${customer.phone_number || 'NOT PROVIDED'}`);
    });
  }

  /**
   * Test if we can join vehicle and customer data manually
   */
  async testCustomerLookup(): Promise<void> {
    console.log('\n🔗 Testing manual customer lookup...');
    
    try {
      // Get Toyota vehicles
      const vehiclesResponse = await apiClient.get(`${this.baseURL}/vehicles/?search=toyota`);
      const vehicles = vehiclesResponse.data || [];
      
      if (vehicles.length === 0) {
        console.log('No Toyota vehicles found for lookup test');
        return;
      }

      // Get all customers
      const customersResponse = await apiClient.get(`${this.baseURL}/customers/`);
      const customers = customersResponse.data || [];
      
      console.log(`Found ${vehicles.length} Toyota vehicles and ${customers.length} customers`);
      
      // Try to match vehicles with customers
      vehicles.forEach((vehicle: any) => {
        const customerId = typeof vehicle.customer === 'number' ? vehicle.customer : vehicle.customer?.id;
        const matchingCustomer = customers.find((c: any) => c.id === customerId);
        
        console.log(`\n🔗 Vehicle ${vehicle.id} (${vehicle.make} ${vehicle.model}):`);
        console.log(`   Customer ID: ${customerId}`);
        if (matchingCustomer) {
          console.log(`   ✅ Found matching customer: ${matchingCustomer.name}`);
          console.log(`   📧 Email: ${matchingCustomer.email}`);
          console.log(`   📞 Phone: ${matchingCustomer.phone_number}`);
        } else {
          console.log(`   ❌ No matching customer found`);
        }
      });
      
    } catch (error) {
      console.error('Customer lookup test failed:', error);
    }
  }
}

// Create instance and expose to window for testing
export const customerDataInvestigator = new CustomerDataInvestigator();

// Make it available in browser console
(window as any).investigateCustomerData = () => customerDataInvestigator.investigateCustomerData();
(window as any).testCustomerLookup = () => customerDataInvestigator.testCustomerLookup();

console.log('🕵️ CustomerDataInvestigator loaded. Run investigateCustomerData() or testCustomerLookup() in console.');
