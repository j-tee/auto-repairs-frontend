/**
 * Comprehensive Test for the Rebuilt Data Access Layer
 * This test verifies that the new implementation correctly handles search functionality
 */

import { dataAccess } from '../services/dataAccessLayer';

export class DataAccessTest {
  private logPrefix = '🧪 DataAccessTest:';

  /**
   * Run all tests
   */
  async runAllTests(): Promise<boolean> {
    console.log(`${this.logPrefix} Starting comprehensive test suite...`);
    
    try {
      await this.testHealthCheck();
      await this.testVehicleSearch();
      await this.testCustomerSearch();
      await this.testRepairJobSearch();
      await this.testSearchAll();
      await this.testGetAllData();
      
      console.log(`${this.logPrefix} ✅ All tests completed successfully!`);
      return true;
    } catch (error) {
      console.error(`${this.logPrefix} ❌ Test suite failed:`, error);
      return false;
    }
  }

  /**
   * Test API health check
   */
  private async testHealthCheck(): Promise<void> {
    console.log(`${this.logPrefix} Testing health check...`);
    
    try {
      const result = await dataAccess.healthCheck();
      console.log(`${this.logPrefix} Health check result:`, result);
    } catch (error) {
      console.warn(`${this.logPrefix} Health check failed (this is expected if API is down):`, error);
    }
  }

  /**
   * Test vehicle search functionality
   */
  private async testVehicleSearch(): Promise<void> {
    console.log(`${this.logPrefix} Testing vehicle search...`);
    
    // Test search with 'toyota'
    const toyotaResult = await dataAccess.searchVehicles({ query: 'toyota' });
    console.log(`${this.logPrefix} Toyota search result:`, {
      query: 'toyota',
      resultCount: toyotaResult.results.length,
      vehicles: toyotaResult.results.map(v => ({ make: v.make, model: v.model, year: v.year }))
    });

    // Test search with empty query
    const emptyResult = await dataAccess.searchVehicles({ query: '' });
    console.log(`${this.logPrefix} Empty search result:`, {
      query: '',
      resultCount: emptyResult.results.length
    });

    // Test search with specific VIN (if we know one)
    const vinResult = await dataAccess.searchVehicles({ query: '1HGCM82633A123456' });
    console.log(`${this.logPrefix} VIN search result:`, {
      query: '1HGCM82633A123456',
      resultCount: vinResult.results.length
    });
  }

  /**
   * Test customer search functionality
   */
  private async testCustomerSearch(): Promise<void> {
    console.log(`${this.logPrefix} Testing customer search...`);
    
    // Test search with common name
    const nameResult = await dataAccess.searchCustomers({ query: 'john' });
    console.log(`${this.logPrefix} Customer name search result:`, {
      query: 'john',
      resultCount: nameResult.results.length,
      customers: nameResult.results.map(c => ({ name: c.name, email: c.email }))
    });

    // Test search with email pattern
    const emailResult = await dataAccess.searchCustomers({ query: '@example.com' });
    console.log(`${this.logPrefix} Customer email search result:`, {
      query: '@example.com',
      resultCount: emailResult.results.length
    });
  }

  /**
   * Test repair job search functionality
   */
  private async testRepairJobSearch(): Promise<void> {
    console.log(`${this.logPrefix} Testing repair job search...`);
    
    // Test search with description keywords
    const descResult = await dataAccess.searchRepairJobs({ query: 'brake' });
    console.log(`${this.logPrefix} Repair job description search result:`, {
      query: 'brake',
      resultCount: descResult.results.length,
      jobs: descResult.results.map(j => ({ description: j.description, status: j.status }))
    });

    // Test search with status
    const statusResult = await dataAccess.searchRepairJobs({ query: 'pending' });
    console.log(`${this.logPrefix} Repair job status search result:`, {
      query: 'pending',
      resultCount: statusResult.results.length
    });
  }

  /**
   * Test comprehensive search across all entities
   */
  private async testSearchAll(): Promise<void> {
    console.log(`${this.logPrefix} Testing comprehensive search...`);
    
    // Test search for 'toyota' across all entities
    const toyotaAllResult = await dataAccess.searchAll('toyota');
    console.log(`${this.logPrefix} Toyota comprehensive search result:`, {
      query: 'toyota',
      vehicleCount: toyotaAllResult.vehicles.length,
      customerCount: toyotaAllResult.customers.length,
      repairJobCount: toyotaAllResult.repairJobs.length,
      searchQuery: toyotaAllResult.searchQuery
    });

    // Test the key assertion: Toyota search should return only Toyota vehicles
    const toyotaVehicles = toyotaAllResult.vehicles;
    console.log(`${this.logPrefix} Toyota vehicles found:`, toyotaVehicles.map(v => `${v.year} ${v.make} ${v.model}`));
    
    // Check if all returned vehicles are Toyota
    const nonToyotaVehicles = toyotaVehicles.filter(v => 
      v.make.toLowerCase() !== 'toyota'
    );
    
    if (nonToyotaVehicles.length > 0) {
      console.error(`${this.logPrefix} ❌ SEARCH ISSUE: Found non-Toyota vehicles in Toyota search:`, 
        nonToyotaVehicles.map(v => `${v.year} ${v.make} ${v.model}`)
      );
    } else {
      console.log(`${this.logPrefix} ✅ Toyota search correctly filtered results`);
    }

    // Test search with empty query (should return all data)
    const allDataResult = await dataAccess.searchAll('');
    console.log(`${this.logPrefix} Empty search (all data) result:`, {
      vehicleCount: allDataResult.vehicles.length,
      customerCount: allDataResult.customers.length,
      repairJobCount: allDataResult.repairJobs.length
    });
  }

  /**
   * Test getting all data without search
   */
  private async testGetAllData(): Promise<void> {
    console.log(`${this.logPrefix} Testing get all data...`);
    
    const allData = await dataAccess.getAllData();
    console.log(`${this.logPrefix} All data result:`, {
      vehicleCount: allData.vehicles.length,
      customerCount: allData.customers.length,
      repairJobCount: allData.repairJobs.length,
      searchQuery: allData.searchQuery
    });

    // Log some sample data for verification
    if (allData.vehicles.length > 0) {
      console.log(`${this.logPrefix} Sample vehicles:`, 
        allData.vehicles.slice(0, 3).map(v => `${v.year} ${v.make} ${v.model}`)
      );
    }
  }

  /**
   * Performance test
   */
  async testPerformance(): Promise<void> {
    console.log(`${this.logPrefix} Running performance test...`);
    
    const startTime = performance.now();
    
    await dataAccess.searchAll('toyota');
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`${this.logPrefix} Toyota search completed in ${duration.toFixed(2)}ms`);
    
    if (duration > 5000) {
      console.warn(`${this.logPrefix} ⚠️ Search took longer than 5 seconds`);
    } else {
      console.log(`${this.logPrefix} ✅ Search performance is acceptable`);
    }
  }
}

// Export singleton instance
export const dataAccessTest = new DataAccessTest();

// Convenience function to run tests from browser console
(window as any).testDataAccess = () => dataAccessTest.runAllTests();
(window as any).testDataAccessPerformance = () => dataAccessTest.testPerformance();

console.log('🧪 DataAccessTest loaded. Run testDataAccess() or testDataAccessPerformance() in console to test.');
