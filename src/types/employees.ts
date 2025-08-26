import type { BaseAPIResponse } from "./api";

/**
 * Employee Domain Types
 * Single source of truth for all employee-related type definitions
 */

// Employee API response structure - matches backend format
export interface EmployeeAPIResponse {
  id: number;
  shop: number;
  name: string;
  role: string;
  phone_number: string;
  email?: string | null;
  picture?: string | null;
  user?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Alternative API response format (if backend uses different field names)
export interface EmployeeAPIResponseAlt extends BaseAPIResponse {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  hourly_rate?: number;
  is_active: boolean;
  role: string;
}

export interface EmployeeListAPIResponse {
  count?: number;
  results?: EmployeeAPIResponse[];
  employees?: EmployeeAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface EmployeeStatsAPIResponse {
  total_employees: number;
  active_employees: number;
  by_department: Array<{
    department: string;
    count: number;
  }>;
  employeesByDepartment: Array<{
    department: string;
    count: number;
  }>;
  employeesByPosition: Array<{
    position: string;
    count: number;
  }>;
  recent_hires: EmployeeAPIResponse[];
  recentHires: EmployeeAPIResponse[];
}

// Core Employee interface - unified from both service and UI needs
export interface Employee {
  id: string;
  shop: number;
  name: string;
  role: string;
  phone: string;
  email: string | null;
  picture: string | null;
  user: number | null;
  
  // Extended fields for UI compatibility
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  department?: string;
  hourlyRate?: number;
  hireDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Employee creation data
export interface CreateEmployeeData {
  shop: number;
  name: string;
  role: string;
  phone_number: string;
  email?: string | null;
  picture?: string | null;
  user?: number | null;
}

// Employee update data
export interface UpdateEmployeeData {
  shop?: number;
  name?: string;
  role?: string;
  phone_number?: string;
  email?: string | null;
  picture?: string | null;
  user?: number | null;
}

// Employee query/filter parameters
export interface EmployeeQuery {
  shop?: number;
  role?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
}



// Employee list response
export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Employee filters for UI components
export interface EmployeeFilters {
  search?: string;
  role?: string[];
  department?: string[];
  isActive?: boolean;
  shop?: number;
}

// Employee stats/analytics
export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  employeesByRole: Record<string, number>;
  employeesByDepartment: Record<string, number>;
  averageHourlyRate: number;
}

// Employee performance metrics
export interface EmployeePerformance {
  employeeId: string;
  completedJobs: number;
  averageJobTime: number;
  customerRating: number;
  efficiency: number;
  period: string;
}

// Employee role definitions
export type EmployeeRole = 
  | 'manager' 
  | 'technician' 
  | 'service_advisor' 
  | 'admin'
  | 'apprentice'
  | 'specialist';

// Employee department definitions
export type EmployeeDepartment = 
  | 'mechanical'
  | 'electrical'
  | 'bodywork'
  | 'service'
  | 'management'
  | 'sales';

// Employee status
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
