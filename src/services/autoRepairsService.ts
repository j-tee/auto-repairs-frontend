import { 
  apiGet, 
  apiPost, 
  apiPatch, 
  apiGetWithPagination,
  apiGetById,
  apiUpdateById,
  apiDeleteById,
  type PaginationParams,
  type FilterParams,
  type SortParams,
  type ApiQueryParams
} from '../utils/api';

// Re-export utility types
export type { PaginationParams, FilterParams, SortParams, ApiQueryParams } from '../utils/api';

// Import types from the slice
import type { Vehicle, RepairJob, Customer } from '../store/slices/autoRepairsSlice';

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleFilters extends FilterParams {
  make?: string;
  model?: string;
  year?: number;
  customerId?: string;
  search?: string; // Search across make, model, VIN, license plate
}

export interface RepairJobFilters extends FilterParams {
  status?: RepairJob['status'] | RepairJob['status'][];
  vehicleId?: string;
  mechanicId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
}

export interface CustomerFilters extends FilterParams {
  search?: string; // Search across name, email, phone
  city?: string;
  state?: string;
}

// Vehicle Services
export const vehicleService = {
  // Get all vehicles with pagination and filtering
  getAll: (
    pagination: PaginationParams = {}, 
    filters: VehicleFilters = {}, 
    sort: SortParams = {}
  ): Promise<PaginatedResponse<Vehicle>> => {
    return apiGetWithPagination<PaginatedResponse<Vehicle>>('/vehicles', pagination, filters, sort);
  },

  // Get vehicle by ID
  getById: (id: string): Promise<Vehicle> => {
    return apiGetById<Vehicle>('/vehicles', id);
  },

  // Get vehicles by customer ID
  getByCustomerId: (customerId: string): Promise<Vehicle[]> => {
    return apiGet<Vehicle[]>('/vehicles', { customerId });
  },

  // Create new vehicle
  create: (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    return apiPost<Vehicle>('/vehicles', vehicleData);
  },

  // Update vehicle
  update: (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    return apiUpdateById<Vehicle>('/vehicles', id, vehicleData);
  },

  // Delete vehicle
  delete: (id: string): Promise<void> => {
    return apiDeleteById<void>('/vehicles', id);
  },

  // Search vehicles by VIN or license plate
  search: (query: string): Promise<Vehicle[]> => {
    return apiGet<Vehicle[]>('/vehicles/search', { q: query });
  },
};

// Repair Job Services
export const repairJobService = {
  // Get all repair jobs with pagination and filtering
  getAll: (
    pagination: PaginationParams = {}, 
    filters: RepairJobFilters = {}, 
    sort: SortParams = {}
  ): Promise<PaginatedResponse<RepairJob>> => {
    return apiGetWithPagination<PaginatedResponse<RepairJob>>('/repair-jobs', pagination, filters, sort);
  },

  // Get repair job by ID
  getById: (id: string): Promise<RepairJob> => {
    return apiGetById<RepairJob>('/repair-jobs', id);
  },

  // Get repair jobs by vehicle ID
  getByVehicleId: (vehicleId: string): Promise<RepairJob[]> => {
    return apiGet<RepairJob[]>('/repair-jobs', { vehicleId });
  },

  // Get repair jobs by customer ID
  getByCustomerId: (customerId: string): Promise<RepairJob[]> => {
    return apiGet<RepairJob[]>('/repair-jobs', { customerId });
  },

  // Get repair jobs by status
  getByStatus: (status: RepairJob['status'] | RepairJob['status'][]): Promise<RepairJob[]> => {
    const statusParam = Array.isArray(status) ? status : [status];
    return apiGet<RepairJob[]>('/repair-jobs', { status: statusParam });
  },

  // Create new repair job
  create: (jobData: Omit<RepairJob, 'id' | 'createdAt'>): Promise<RepairJob> => {
    const dataWithTimestamp = {
      ...jobData,
      createdAt: new Date().toISOString(),
    };
    return apiPost<RepairJob>('/repair-jobs', dataWithTimestamp);
  },

  // Update repair job
  update: (id: string, jobData: Partial<RepairJob>): Promise<RepairJob> => {
    return apiUpdateById<RepairJob>('/repair-jobs', id, jobData);
  },

  // Update repair job status
  updateStatus: (id: string, status: RepairJob['status']): Promise<RepairJob> => {
    const updateData = { 
      status,
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
    };
    return apiUpdateById<RepairJob>('/repair-jobs', id, updateData);
  },

  // Delete repair job
  delete: (id: string): Promise<void> => {
    return apiDeleteById<void>('/repair-jobs', id);
  },

  // Get repair job statistics
  getStatistics: (filters?: Record<string, any>): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    averageCost: number;
    totalRevenue: number;
  }> => {
    return apiGet('/repair-jobs/statistics', filters);
  },

  // Get jobs due today
  getDueToday: (): Promise<RepairJob[]> => {
    const today = new Date().toISOString().split('T')[0];
    return apiGet<RepairJob[]>('/repair-jobs', { 
      dueDate: today,
      status: ['pending', 'in-progress'] 
    });
  },
};

// Customer Services
export const customerService = {
  // Get all customers with pagination and filtering
  getAll: (
    pagination: PaginationParams = {}, 
    filters: CustomerFilters = {}, 
    sort: SortParams = {}
  ): Promise<PaginatedResponse<Customer>> => {
    return apiGetWithPagination<PaginatedResponse<Customer>>('/customers', pagination, filters, sort);
  },

  // Get customer by ID
  getById: (id: string): Promise<Customer> => {
    return apiGetById<Customer>('/customers', id);
  },

  // Create new customer
  create: (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    return apiPost<Customer>('/customers', customerData);
  },

  // Update customer
  update: (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    return apiUpdateById<Customer>('/customers', id, customerData);
  },

  // Delete customer
  delete: (id: string): Promise<void> => {
    return apiDeleteById<void>('/customers', id);
  },

  // Search customers by name, email, or phone
  search: (query: string): Promise<Customer[]> => {
    return apiGet<Customer[]>('/customers/search', { q: query });
  },

  // Get customer's repair history
  getRepairHistory: (customerId: string): Promise<RepairJob[]> => {
    return apiGet<RepairJob[]>(`/customers/${customerId}/repair-jobs`);
  },

  // Get customer's vehicles
  getVehicles: (customerId: string): Promise<Vehicle[]> => {
    return apiGet<Vehicle[]>(`/customers/${customerId}/vehicles`);
  },
};

// Reporting Services
export const reportingService = {
  // Get dashboard summary
  getDashboardSummary: (): Promise<{
    totalVehicles: number;
    totalCustomers: number;
    activeJobs: number;
    completedJobsThisMonth: number;
    revenueThisMonth: number;
    pendingJobs: number;
  }> => {
    return apiGet('/reports/dashboard');
  },

  // Get revenue report
  getRevenueReport: (dateFrom: string, dateTo: string): Promise<{
    totalRevenue: number;
    jobCount: number;
    averageJobValue: number;
    dailyBreakdown: Array<{
      date: string;
      revenue: number;
      jobCount: number;
    }>;
  }> => {
    return apiGet('/reports/revenue', { dateFrom, dateTo });
  },

  // Get performance metrics
  getPerformanceMetrics: (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    averageCompletionTime: number;
    customerSatisfactionRate: number;
    repeatCustomerRate: number;
    jobStatusDistribution: Record<RepairJob['status'], number>;
  }> => {
    return apiGet('/reports/performance', { period });
  },
};

// Inventory Services (for future expansion)
export const inventoryService = {
  // Get parts inventory
  getParts: (filters?: { category?: string; lowStock?: boolean }): Promise<any[]> => {
    return apiGet('/inventory/parts', filters);
  },

  // Update part quantity
  updatePartQuantity: (partId: string, quantity: number): Promise<any> => {
    return apiPatch(`/inventory/parts/${partId}`, { quantity });
  },
};

// Export all services
export {
  vehicleService as vehicles,
  repairJobService as repairJobs,
  customerService as customers,
  reportingService as reports,
  inventoryService as inventory,
};
