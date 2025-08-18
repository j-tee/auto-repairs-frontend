import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  fetchVehicles, 
  fetchRepairJobs, 
  fetchCustomers,
  createRepairJob,
  updateRepairJobStatus,
  clearError,
  clearErrors,
  type RepairJob 
} from '../store/slices/autoRepairsSlice';
import { 
  vehicles, 
  repairJobs, 
  customers, 
  reports,
  type VehicleFilters,
  type RepairJobFilters,
  type CustomerFilters,
  type PaginationParams,
  type SortParams 
} from '../services/autoRepairsService';
import { buildQueryString } from '../utils/api';

export const useEnhancedAutoRepairs = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.autoRepairs);
  
  // Local state for advanced features
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    vehicles: any[];
    customers: any[];
    jobs: any[];
  }>({ vehicles: [], customers: [], jobs: [] });

  // Enhanced data loading with filters and pagination
  const loadVehiclesWithFilters = useCallback(async (
    filters: VehicleFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
    sort: SortParams = { sortBy: 'make', sortOrder: 'asc' }
  ) => {
    setIsLoading(true);
    try {
      const response = await vehicles.getAll(pagination, filters, sort);
      console.log('Vehicles loaded with query:', buildQueryString({ ...filters, ...pagination, ...sort }));
      return response;
    } catch (error) {
      console.error('Error loading vehicles:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRepairJobsWithFilters = useCallback(async (
    filters: RepairJobFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
    sort: SortParams = { sortBy: 'createdAt', sortOrder: 'desc' }
  ) => {
    setIsLoading(true);
    try {
      const response = await repairJobs.getAll(pagination, filters, sort);
      console.log('Repair jobs loaded with query:', buildQueryString({ ...filters, ...pagination, ...sort }));
      return response;
    } catch (error) {
      console.error('Error loading repair jobs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCustomersWithFilters = useCallback(async (
    filters: CustomerFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
    sort: SortParams = { sortBy: 'name', sortOrder: 'asc' }
  ) => {
    setIsLoading(true);
    try {
      const response = await customers.getAll(pagination, filters, sort);
      console.log('Customers loaded with query:', buildQueryString({ ...filters, ...pagination, ...sort }));
      return response;
    } catch (error) {
      console.error('Error loading customers:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search functionality
  const searchAll = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ vehicles: [], customers: [], jobs: [] });
      return;
    }

    setIsLoading(true);
    try {
      const [vehicleResults, customerResults] = await Promise.all([
        vehicles.search(query),
        customers.search(query),
      ]);

      // Search repair jobs by description
      const jobResults = await repairJobs.getAll(
        { page: 1, limit: 20 },
        { search: query },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );

      setSearchResults({
        vehicles: vehicleResults,
        customers: customerResults,
        jobs: jobResults.data,
      });

      console.log('Search completed for:', query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advanced filtering examples
  const getJobsByStatus = useCallback(async (status: RepairJob['status'] | RepairJob['status'][]) => {
    try {
      return await repairJobs.getByStatus(status);
    } catch (error) {
      console.error('Error filtering jobs by status:', error);
      throw error;
    }
  }, []);

  const getJobsByDateRange = useCallback(async (dateFrom: string, dateTo: string) => {
    try {
      return await repairJobs.getAll(
        { page: 1, limit: 100 },
        { dateFrom, dateTo },
        { sortBy: 'createdAt', sortOrder: 'desc' }
      );
    } catch (error) {
      console.error('Error filtering jobs by date range:', error);
      throw error;
    }
  }, []);

  const getJobsByPriceRange = useCallback(async (minCost: number, maxCost: number) => {
    try {
      return await repairJobs.getAll(
        { page: 1, limit: 100 },
        { estimatedCostMin: minCost, estimatedCostMax: maxCost },
        { sortBy: 'estimatedCost', sortOrder: 'asc' }
      );
    } catch (error) {
      console.error('Error filtering jobs by price range:', error);
      throw error;
    }
  }, []);

  // Vehicle-specific operations
  const getVehiclesByCustomer = useCallback(async (customerId: string) => {
    try {
      return await vehicles.getByCustomerId(customerId);
    } catch (error) {
      console.error('Error loading customer vehicles:', error);
      throw error;
    }
  }, []);

  const getVehiclesByMakeModel = useCallback(async (make?: string, model?: string, year?: number) => {
    try {
      return await vehicles.getAll(
        { page: 1, limit: 50 },
        { make, model, year },
        { sortBy: 'year', sortOrder: 'desc' }
      );
    } catch (error) {
      console.error('Error filtering vehicles:', error);
      throw error;
    }
  }, []);

  // Reporting functions
  const getDashboardSummary = useCallback(async () => {
    try {
      return await reports.getDashboardSummary();
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
      throw error;
    }
  }, []);

  const getRevenueReport = useCallback(async (dateFrom: string, dateTo: string) => {
    try {
      return await reports.getRevenueReport(dateFrom, dateTo);
    } catch (error) {
      console.error('Error loading revenue report:', error);
      throw error;
    }
  }, []);

  const getJobStatistics = useCallback(async (filters?: Record<string, any>) => {
    try {
      return await repairJobs.getStatistics(filters);
    } catch (error) {
      console.error('Error loading job statistics:', error);
      throw error;
    }
  }, []);

  // Original Redux operations
  const loadVehicles = useCallback(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const loadRepairJobs = useCallback(() => {
    dispatch(fetchRepairJobs());
  }, [dispatch]);

  const loadCustomers = useCallback(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const loadAllData = useCallback(() => {
    dispatch(fetchVehicles());
    dispatch(fetchRepairJobs());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const createJob = useCallback((jobData: Omit<RepairJob, 'id' | 'createdAt'>) => {
    return dispatch(createRepairJob(jobData));
  }, [dispatch]);

  const updateJobStatus = useCallback((id: string, status: RepairJob['status']) => {
    return dispatch(updateRepairJobStatus({ id, status }));
  }, [dispatch]);

  const handleClearError = useCallback((errorType: keyof typeof state.error) => {
    dispatch(clearError(errorType));
  }, [dispatch]);

  const handleClearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  return {
    // Redux State
    vehicles: state.vehicles,
    repairJobs: state.repairJobs,
    customers: state.customers,
    loading: state.loading,
    error: state.error,
    
    // Enhanced Features
    isLoading,
    searchResults,
    
    // Basic Redux Actions
    loadVehicles,
    loadRepairJobs,
    loadCustomers,
    loadAllData,
    createJob,
    updateJobStatus,
    clearError: handleClearError,
    clearAllErrors: handleClearAllErrors,
    
    // Enhanced API Operations with Filtering
    loadVehiclesWithFilters,
    loadRepairJobsWithFilters,
    loadCustomersWithFilters,
    
    // Search Operations
    searchAll,
    
    // Advanced Filtering
    getJobsByStatus,
    getJobsByDateRange,
    getJobsByPriceRange,
    getVehiclesByCustomer,
    getVehiclesByMakeModel,
    
    // Reporting
    getDashboardSummary,
    getRevenueReport,
    getJobStatistics,
  };
};
