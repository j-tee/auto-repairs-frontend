/**
 * Rebuilt Data Access Layer for Auto Repairs Dashboard
 * Clean implementation with proper error handling and search functionality
 */

import { apiClient, ApiError } from '../utils/api';
import type { Vehicle, Customer } from '../types/entities';

// Core API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
}

// Search Parameters
export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
}

// Repair Job Interface
export interface RepairJob {
  id: string;
  vehicleId: string;
  customerId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  mechanicId?: string;
  vehicle?: Vehicle;
  customer?: Customer;
}

// Dashboard Summary
export interface DashboardSummary {
  vehicles: Vehicle[];
  customers: Customer[];
  repairJobs: RepairJob[];
  searchQuery?: string;
  totalCounts: {
    vehicles: number;
    customers: number;
    repairJobs: number;
  };
}

/**
 * Core Data Access Class
 */
export class DataAccessLayer {
  private baseURL = '/shop';

  /**
   * Search Vehicles
   */
  async searchVehicles(params: SearchParams): Promise<SearchResponse<Vehicle>> {
    try {
      console.log('🔍 DataAccessLayer.searchVehicles:', params);
      
      const searchParams = new URLSearchParams({
        search: params.query,
        expand: 'customer', // Request expanded customer information
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
      });

      const response = await apiClient.get<Vehicle[]>(
        `${this.baseURL}/vehicles/?${searchParams.toString()}`
      );

      const results = response.data || [];
      
      console.log('✅ Vehicle search response:', {
        query: params.query,
        resultCount: results.length,
        vehicles: results.map(v => ({ 
          id: v.id, 
          make: v.make, 
          model: v.model,
          year: v.year,
          customer_name: v.customer_name,
          customer_email: v.customer_email,
          customer_phone: v.customer_phone,
          has_customer_info: !!(v.customer_name || v.customer_email || v.customer_phone)
        }))
      });

      return {
        results,
        total: results.length,
        query: params.query
      };
    } catch (error) {
      console.error('❌ Vehicle search failed:', error);
      throw new ApiError(
        `Vehicle search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Search Customers
   */
  async searchCustomers(params: SearchParams): Promise<SearchResponse<Customer>> {
    try {
      console.log('🔍 DataAccessLayer.searchCustomers:', params);
      
      const searchParams = new URLSearchParams({
        search: params.query,
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
      });

      const response = await apiClient.get<Customer[]>(
        `${this.baseURL}/customers/?${searchParams.toString()}`
      );

      const results = response.data || [];
      
      console.log('✅ Customer search response:', {
        query: params.query,
        resultCount: results.length,
        customers: results.map(c => ({ id: c.id, name: c.name, email: c.email }))
      });

      return {
        results,
        total: results.length,
        query: params.query
      };
    } catch (error) {
      console.error('❌ Customer search failed:', error);
      throw new ApiError(
        `Customer search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Search Repair Jobs
   */
  async searchRepairJobs(params: SearchParams): Promise<SearchResponse<RepairJob>> {
    try {
      console.log('🔍 DataAccessLayer.searchRepairJobs:', params);
      
      const searchParams = new URLSearchParams({
        search: params.query,
        page: (params.page || 1).toString(),
        limit: (params.limit || 20).toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const response = await apiClient.get<PaginatedApiResponse<RepairJob>>(
        `${this.baseURL}/repair-orders/?${searchParams.toString()}`
      );

      const responseData = response.data;
      const results = Array.isArray(responseData) ? responseData : responseData.data || [];
      
      console.log('✅ Repair job search response:', {
        query: params.query,
        resultCount: results.length,
        jobs: results.map(j => ({ id: j.id, description: j.description, status: j.status }))
      });

      return {
        results,
        total: Array.isArray(responseData) ? results.length : responseData.total || results.length,
        query: params.query
      };
    } catch (error) {
      console.error('❌ Repair job search failed:', error);
      throw new ApiError(
        `Repair job search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Get All Data (no search filter)
   */
  async getAllData(): Promise<DashboardSummary> {
    try {
      console.log('🔍 DataAccessLayer.getAllData - fetching all records');
      
      const [vehiclesResponse, customersResponse, repairJobsResponse] = await Promise.allSettled([
        apiClient.get<Vehicle[]>(`${this.baseURL}/vehicles/?expand=customer`),
        apiClient.get<Customer[]>(`${this.baseURL}/customers/`),
        apiClient.get<PaginatedApiResponse<RepairJob>>(`${this.baseURL}/repair-orders/?page=1&limit=20&sortBy=createdAt&sortOrder=desc`)
      ]);

      const vehicles = vehiclesResponse.status === 'fulfilled' ? (vehiclesResponse.value.data || []) : [];
      const customers = customersResponse.status === 'fulfilled' ? (customersResponse.value.data || []) : [];
      const repairJobsData = repairJobsResponse.status === 'fulfilled' ? repairJobsResponse.value.data : null;
      const repairJobs = repairJobsData ? (Array.isArray(repairJobsData) ? repairJobsData : repairJobsData.data || []) : [];

      console.log('✅ All data fetched:', {
        vehicleCount: vehicles.length,
        customerCount: customers.length,
        repairJobCount: repairJobs.length
      });

      return {
        vehicles,
        customers,
        repairJobs,
        totalCounts: {
          vehicles: vehicles.length,
          customers: customers.length,
          repairJobs: repairJobs.length
        }
      };
    } catch (error) {
      console.error('❌ Get all data failed:', error);
      throw new ApiError(
        `Failed to fetch dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Comprehensive Search - searches across all entities
   */
  async searchAll(query: string): Promise<DashboardSummary> {
    try {
      if (!query || query.trim().length === 0) {
        return this.getAllData();
      }

      const trimmedQuery = query.trim();
      console.log('🔍 DataAccessLayer.searchAll:', { originalQuery: query, trimmedQuery });

      const searchParams: SearchParams = { query: trimmedQuery };

      const [vehicleResults, customerResults, repairJobResults] = await Promise.allSettled([
        this.searchVehicles(searchParams),
        this.searchCustomers(searchParams),
        this.searchRepairJobs(searchParams)
      ]);

      const vehicles = vehicleResults.status === 'fulfilled' ? vehicleResults.value.results : [];
      const customers = customerResults.status === 'fulfilled' ? customerResults.value.results : [];
      const repairJobs = repairJobResults.status === 'fulfilled' ? repairJobResults.value.results : [];

      // Log any errors
      if (vehicleResults.status === 'rejected') {
        console.error('Vehicle search failed:', vehicleResults.reason);
      }
      if (customerResults.status === 'rejected') {
        console.error('Customer search failed:', customerResults.reason);
      }
      if (repairJobResults.status === 'rejected') {
        console.error('Repair job search failed:', repairJobResults.reason);
      }

      console.log('✅ Search all completed:', {
        query: trimmedQuery,
        vehicleCount: vehicles.length,
        customerCount: customers.length,
        repairJobCount: repairJobs.length
      });

      return {
        vehicles,
        customers,
        repairJobs,
        searchQuery: trimmedQuery,
        totalCounts: {
          vehicles: vehicles.length,
          customers: customers.length,
          repairJobs: repairJobs.length
        }
      };
    } catch (error) {
      console.error('❌ Search all failed:', error);
      throw new ApiError(
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }

  /**
   * Health Check - verify API connectivity
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new ApiError(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof ApiError ? error.status : undefined
      );
    }
  }
}

// Create singleton instance
export const dataAccess = new DataAccessLayer();

// Export convenience functions
export const searchVehicles = (params: SearchParams) => dataAccess.searchVehicles(params);
export const searchCustomers = (params: SearchParams) => dataAccess.searchCustomers(params);
export const searchRepairJobs = (params: SearchParams) => dataAccess.searchRepairJobs(params);
export const searchAll = (query: string) => dataAccess.searchAll(query);
export const getAllData = () => dataAccess.getAllData();
export const healthCheck = () => dataAccess.healthCheck();
