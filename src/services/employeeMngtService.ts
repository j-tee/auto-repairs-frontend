import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeQuery,
  EmployeeListResponse,
  EmployeeAPIResponse
} from '../types/employees';

// Note: All types now imported from centralized employee types


// Note: EmployeeListResponse now imported from centralized types

// Helper function to transform API response to frontend Employee
const transformEmployeeData = (apiEmployee: EmployeeAPIResponse): Employee => {
  return {
    id: apiEmployee.id.toString(),
    shop: apiEmployee.shop,
    name: apiEmployee.name,
    role: apiEmployee.role,
    phone: apiEmployee.phone_number,
    email: apiEmployee.email ?? null,
    picture: apiEmployee.picture ?? null,
    user: apiEmployee.user ?? null
  };
};

// Employee Management Service
export const employeeMngtService = {
  // Get all employees with filtering
  getEmployees: async (query: EmployeeQuery = {}): Promise<EmployeeListResponse> => {
    const params = new URLSearchParams();
    
    if (query.shop) params.append('shop', query.shop.toString());
    if (query.role) params.append('role', query.role);
    if (query.search) params.append('search', query.search);
    if (query.ordering) params.append('ordering', query.ordering);
    
    const queryString = params.toString();
    const endpoint = `/api/shop/employees/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<EmployeeAPIResponse[]>(endpoint);
    
    // Handle both array response and paginated response
    const employees = Array.isArray(response) ? response : [];
    
    return {
      employees: employees.map(transformEmployeeData),
      total: employees.length
    };
  },

  // Get employee by ID
  getEmployeeById: async (employeeId: string): Promise<Employee> => {
    const response = await apiGet<EmployeeAPIResponse>(`/api/shop/employees/${employeeId}/`);
    return transformEmployeeData(response);
  },

  // Create new employee
  createEmployee: async (employeeData: CreateEmployeeData): Promise<Employee> => {
    const response = await apiPost<EmployeeAPIResponse>('/api/shop/employees/', employeeData);
    return transformEmployeeData(response);
  },

  // Update employee
  updateEmployee: async (employeeId: string, employeeData: UpdateEmployeeData): Promise<Employee> => {
    const response = await apiPut<EmployeeAPIResponse>(`/api/shop/employees/${employeeId}/`, employeeData);
    return transformEmployeeData(response);
  },

  // Delete employee
  deleteEmployee: async (employeeId: string): Promise<void> => {
    await apiDelete(`/api/shop/employees/${employeeId}/`);
  },

  // Search employees by name, role, or email
  searchEmployees: async (searchTerm: string, options: { shop?: number; role?: string } = {}): Promise<Employee[]> => {
    const query: EmployeeQuery = {
      search: searchTerm,
      ...options
    };
    
    const response = await employeeMngtService.getEmployees(query);
    return response.employees;
  },

  // Get employees by shop
  getEmployeesByShop: async (shopId: number): Promise<Employee[]> => {
    const response = await employeeMngtService.getEmployees({ shop: shopId });
    return response.employees;
  },

  // Get employees by role
  getEmployeesByRole: async (role: string): Promise<Employee[]> => {
    const response = await employeeMngtService.getEmployees({ role });
    return response.employees;
  }
};