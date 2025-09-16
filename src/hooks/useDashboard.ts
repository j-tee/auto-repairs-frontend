/**
 * Consolidated Dashboard Hook - Uses consolidated management services
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  vehicleMngtService,
  customerMngtService,
  repairOrderMngtService,
  appointmentMngtService,
  employeeMngtService,
  shopMngtService
} from '../services';
import { ApiError } from '../utils/api';

// Dashboard summary interface
interface DashboardSummary {
  vehicles: any[];
  customers: any[];
  repairOrders: any[];
  appointments: any[];
  employees: any[];
  shops: any[];
  totalCounts: {
    vehicles: number;
    customers: number;
    repairOrders: number;
    appointments: number;
    employees: number;
    shops: number;
  };
}

// Hook state interface
interface DashboardState {
  data: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  lastSearchQuery: string;
}

// Hook return interface
interface DashboardHookReturn extends DashboardState {
  search: (query: string) => Promise<void>;
  loadAll: () => Promise<void>;
  clearResults: () => void;
  refresh: () => Promise<void>;
}

/**
 * Consolidated Dashboard Hook
 * Provides search and data loading functionality for the dashboard
 */
export const useDashboard = (): DashboardHookReturn => {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: false,
    error: null,
    lastSearchQuery: ''
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Search across all entities
   */
  const search = useCallback(async (query: string) => {
    try {
      
      updateState({ isLoading: true, error: null });
      
      // Search across all services
      const [
        vehicleResults,
        customerResults,
        repairOrderResults,
        appointmentResults,
        employeeResults,
        shopResults
      ] = await Promise.allSettled([
        vehicleMngtService.getVehicles({ limit: 20 }),
        customerMngtService.getCustomers({ limit: 20 }),
        repairOrderMngtService.getRepairOrders({ limit: 20 }),
        appointmentMngtService.getAppointments({ limit: 20 }),
        employeeMngtService.getEmployees({ limit: 20 }),
        shopMngtService.getShops({ limit: 20 })
      ]);

      // Filter results by search query
      const vehicles = vehicleResults.status === 'fulfilled' 
        ? vehicleResults.value.vehicles.filter((v: any) => 
            v.make?.toLowerCase().includes(query.toLowerCase()) ||
            v.model?.toLowerCase().includes(query.toLowerCase()) ||
            v.licensePlate?.toLowerCase().includes(query.toLowerCase()) ||
            v.vin?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const customers = customerResults.status === 'fulfilled'
        ? customerResults.value.customers.filter((c: any) => 
            c.name?.toLowerCase().includes(query.toLowerCase()) ||
            c.firstName?.toLowerCase().includes(query.toLowerCase()) ||
            c.lastName?.toLowerCase().includes(query.toLowerCase()) ||
            c.email?.toLowerCase().includes(query.toLowerCase()) ||
            c.phone?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const repairOrders = repairOrderResults.status === 'fulfilled'
        ? repairOrderResults.value.repairOrders.filter((r: any) => 
            r.description?.toLowerCase().includes(query.toLowerCase()) ||
            r.workOrderNumber?.toLowerCase().includes(query.toLowerCase()) ||
            r.customerComplaints?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const appointments = appointmentResults.status === 'fulfilled'
        ? appointmentResults.value.appointments.filter((a: any) => 
            a.description?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const employees = employeeResults.status === 'fulfilled'
        ? employeeResults.value.employees.filter((e: any) => 
            e.firstName?.toLowerCase().includes(query.toLowerCase()) ||
            e.lastName?.toLowerCase().includes(query.toLowerCase()) ||
            e.email?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const shops = shopResults.status === 'fulfilled'
        ? shopResults.value.shops.filter((s: any) => 
            s.name?.toLowerCase().includes(query.toLowerCase()) ||
            s.address?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      const result: DashboardSummary = {
        vehicles,
        customers,
        repairOrders,
        appointments,
        employees,
        shops,
        totalCounts: {
          vehicles: vehicles.length,
          customers: customers.length,
          repairOrders: repairOrders.length,
          appointments: appointments.length,
          employees: employees.length,
          shops: shops.length
        }
      };
      
      updateState({
        data: result,
        isLoading: false,
        lastSearchQuery: query,
        error: null
      });

      // Search results: query=${query}, vehicleCount=${vehicles.length}, customerCount=${customers.length}, repairOrderCount=${repairOrders.length}, appointmentCount=${appointments.length}, employeeCount=${employees.length}, shopCount=${shops.length}
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Search failed';
      
      
      updateState({
        isLoading: false,
        error: errorMessage,
        data: null
      });
    }
  }, [updateState]);

  /**
   * Load all data without search filter
   */
  const loadAll = useCallback(async () => {
    try {
      
      updateState({ isLoading: true, error: null });
      
      // Load data from all services
      const [
        vehicleResults,
        customerResults,
        repairOrderResults,
        appointmentResults,
        employeeResults,
        shopResults
      ] = await Promise.allSettled([
        vehicleMngtService.getVehicles({ limit: 50 }),
        customerMngtService.getCustomers({ limit: 50 }),
        repairOrderMngtService.getRepairOrders({ limit: 50 }),
        appointmentMngtService.getAppointments({ limit: 50 }),
        employeeMngtService.getEmployees({ limit: 50 }),
        shopMngtService.getShops({ limit: 50 })
      ]);

      const vehicles = vehicleResults.status === 'fulfilled' ? vehicleResults.value.vehicles : [];
      const customers = customerResults.status === 'fulfilled' ? customerResults.value.customers : [];
      const repairOrders = repairOrderResults.status === 'fulfilled' ? repairOrderResults.value.repairOrders : [];
      const appointments = appointmentResults.status === 'fulfilled' ? appointmentResults.value.appointments : [];
      const employees = employeeResults.status === 'fulfilled' ? employeeResults.value.employees : [];
      const shops = shopResults.status === 'fulfilled' ? shopResults.value.shops : [];

      // Log any failed service calls for debugging
      if (vehicleResults.status === 'rejected') {
      }
      if (customerResults.status === 'rejected') {
      }
      if (repairOrderResults.status === 'rejected') {
      }
      if (appointmentResults.status === 'rejected') {
      }
      if (employeeResults.status === 'rejected') {
      }
      if (shopResults.status === 'rejected') {
      }

      const result: DashboardSummary = {
        vehicles,
        customers,
        repairOrders,
        appointments,
        employees,
        shops,
        totalCounts: {
          vehicles: vehicles.length,
          customers: customers.length,
          repairOrders: repairOrders.length,
          appointments: appointments.length,
          employees: employees.length,
          shops: shops.length
        }
      };
      
      updateState({
        data: result,
        isLoading: false,
        lastSearchQuery: '',
        error: null
      });

      // Dashboard stats: vehicleCount=${vehicles.length}, customerCount=${customers.length}, repairOrderCount=${repairOrders.length}, appointmentCount=${appointments.length}, employeeCount=${employees.length}, shopCount=${shops.length}
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to load data';
      
      
      updateState({
        isLoading: false,
        error: errorMessage,
        data: null
      });
    }
  }, [updateState]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    updateState({
      data: null,
      error: null,
      lastSearchQuery: ''
    });
  }, [updateState]);

  /**
   * Refresh current view (re-run last search or load all)
   */
  const refresh = useCallback(async () => {
    if (state.lastSearchQuery) {
      await search(state.lastSearchQuery);
    } else {
      await loadAll();
    }
  }, [state.lastSearchQuery, search, loadAll]);

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastSearchQuery: state.lastSearchQuery,
    search,
    loadAll,
    clearResults,
    refresh
  };
};

/**
 * Test Hook for debugging
 * This hook provides direct access to individual search functions
 */
export const useDashboardTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testVehicleSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await vehicleMngtService.getVehicles({ limit: 10 });
      const filtered = result.vehicles.filter((v: any) =>
        v.make?.toLowerCase().includes(query.toLowerCase()) ||
        v.model?.toLowerCase().includes(query.toLowerCase()) ||
        v.licensePlate?.toLowerCase().includes(query.toLowerCase())
      );
      setLastResult(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testCustomerSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await customerMngtService.getCustomers({ limit: 10 });
      const filtered = result.customers.filter((c: any) =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.email?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.toLowerCase().includes(query.toLowerCase())
      );
      setLastResult(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testRepairJobSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await repairOrderMngtService.getRepairOrders({ limit: 10 });
      const filtered = result.repairOrders.filter((r: any) =>
        r.description?.toLowerCase().includes(query.toLowerCase()) ||
        r.workOrderNumber?.toLowerCase().includes(query.toLowerCase())
      );
      setLastResult(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testHealthCheck = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Simple health check by trying to load a small amount of data
      const results = await Promise.allSettled([
        vehicleMngtService.getVehicles({ limit: 1 }),
        customerMngtService.getCustomers({ limit: 1 }),
        repairOrderMngtService.getRepairOrders({ limit: 1 })
      ]);
      
      const healthStatus = {
        vehicles: results[0].status === 'fulfilled' ? 'OK' : 'ERROR',
        customers: results[1].status === 'fulfilled' ? 'OK' : 'ERROR',
        repairOrders: results[2].status === 'fulfilled' ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(healthStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    lastResult,
    error,
    testVehicleSearch,
    testCustomerSearch,
    testRepairJobSearch,
    testHealthCheck
  };
};
