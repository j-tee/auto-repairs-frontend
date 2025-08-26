import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
// Import API response types
import type {
  CustomerAPIResponse,
  CustomerListAPIResponse,
  CustomerStatsAPIResponse,
  CustomerHistoryAPIResponse,
  Customer
} from '../types/customers';

// Raw customer data as received from API
type CustomerRawData = CustomerAPIResponse;

// Import backend-aligned Customer type
import type { CreateCustomerData } from '../types';


// export interface CreateCustomerData {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   city?: string;
//   state?: string;
//   zipCode?: string;
//   emergencyContact?: string;
//   emergencyPhone?: string;
//   preferredContact?: 'email' | 'phone' | 'text';
// }

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredContact?: 'email' | 'phone' | 'text';
  isActive?: boolean; // Can be updated through User relationship
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  averageVisitsPerCustomer: number;
  totalRevenue: number;
}

export interface CustomerHistory {
  customerId: string;
  appointments: unknown[];
  repairOrders: unknown[];
  vehicles: unknown[];
  totalSpent: number;
  lastVisit: string | null;
  visitCount: number;
}

// Helper function to transform API response to Customer
const transformCustomerData = (customerData: CustomerRawData): Customer => {
  return {
    id: customerData.id?.toString() || '',
    name: customerData.name || `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || '',
    email: customerData.email || '',
    phone: customerData.phone_number || customerData.phone || '',
    address: customerData.address || '',
    city: customerData.city,
    state: customerData.state,
    zip_code: customerData.zip_code,
    emergency_contact: customerData.emergency_contact,
    emergency_phone: customerData.emergency_phone,
    preferred_contact: customerData.preferred_contact,
    is_active: customerData.user?.is_active ?? customerData.is_active ?? true,
    created_at: customerData.created_at || new Date().toISOString(),
    updated_at: customerData.updated_at || new Date().toISOString()
  };
};

// Service implementation
export const customerMngtService = {
  // Get all customers with pagination and filtering
  getCustomers: async (query: CustomerQuery = {}): Promise<CustomerListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.email) params.append('email', query.email);
    if (query.phone) params.append('phone', query.phone);
    if (query.city) params.append('city', query.city);
    if (query.state) params.append('state', query.state);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/shop/customers/${queryString ? `?${queryString}` : ''}`;
    const response = await apiGet<CustomerListAPIResponse>(endpoint);
    
    // Handle different response structures - API might return array directly or wrapped
    let customerArray: CustomerRawData[] = [];
    if (Array.isArray(response)) {
      customerArray = response as CustomerRawData[];
    } else if (Array.isArray((response as CustomerListAPIResponse).results)) {
      customerArray = (response as CustomerListAPIResponse).results as CustomerRawData[];
    } else if (Array.isArray((response as CustomerListAPIResponse).customers)) {
      customerArray = (response as CustomerListAPIResponse).customers as CustomerRawData[];
    }
    
    return {
      customers: customerArray.map(transformCustomerData),
      total: (response as CustomerListAPIResponse).count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(((response as CustomerListAPIResponse).count || 0) / (query.limit || 10))
    };
  },

  // Get customer by ID
  getCustomerById: async (customerId: string): Promise<Customer> => {
    const response = await apiGet<CustomerAPIResponse>(`/shop/customers/${customerId}/`);
    return transformCustomerData(response as CustomerRawData);
  },

  // Create new customer
  createCustomer: async (customerData: CreateCustomerData): Promise<Customer> => {
    // Split name into first_name and last_name
    const nameParts = customerData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const createData = {
      first_name: firstName,
      last_name: lastName,
      email: customerData.email,
      phone_number: customerData.phone_number,
      address: customerData.address
    };
    
    const response = await apiPost<CustomerAPIResponse>(`/shop/customers/`, createData);
    return transformCustomerData(response as CustomerRawData);
  },

  // Update customer
  updateCustomer: async (customerId: string, customerData: UpdateCustomerData): Promise<Customer> => {
    const updateData: Record<string, unknown> = {};
    
    // Handle name update - split into first_name and last_name
    if (customerData.name !== undefined) {
      const nameParts = customerData.name.trim().split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }
    
    if (customerData.phone !== undefined) updateData.phone_number = customerData.phone;
    if (customerData.email !== undefined) updateData.email = customerData.email;
    if (customerData.address !== undefined) updateData.address = customerData.address;
    
    const response = await apiPut<CustomerAPIResponse>(`/shop/customers/${customerId}/`, updateData);
    return transformCustomerData(response as CustomerRawData);
  },

  // Delete customer (hard delete - use with caution)
  deleteCustomer: async (customerId: string): Promise<void> => {
    await apiDelete(`/shop/customers/${customerId}/`);
  },

  // Deactivate customer (set User.is_active = false)
  deactivateCustomer: async (customerId: string): Promise<Customer> => {
    const response = await apiPut<CustomerAPIResponse>(`/shop/customers/${customerId}/deactivate/`, {});
    return transformCustomerData(response as CustomerRawData);
  },

  // Activate customer (set User.is_active = true)
  activateCustomer: async (customerId: string): Promise<Customer> => {
    const response = await apiPut<CustomerAPIResponse>(`/shop/customers/${customerId}/activate/`, {});
    return transformCustomerData(response as CustomerRawData);
  },

  // Search customers
  searchCustomers: async (searchTerm: string, options: { limit?: number; includeInactive?: boolean } = {}): Promise<Customer[]> => {
    const query: CustomerQuery = {
      search: searchTerm,
      limit: options.limit || 10
    };
    
    if (!options.includeInactive) {
      query.isActive = true;
    }
    
    const response = await customerMngtService.getCustomers(query);
    return response.customers;
  },

  // Get customer statistics
  getCustomerStats: async (): Promise<CustomerStats> => {
    const response = await apiGet<CustomerStatsAPIResponse>(`/shop/customers/stats/`);
    
    return {
      totalCustomers: response.total_customers || 0,
      activeCustomers: response.active_customers || 0,
      inactiveCustomers: response.inactive_customers || 0,
      newCustomersThisMonth: response.new_customers_this_month || response.new_this_month || 0,
      averageVisitsPerCustomer: response.average_visits_per_customer || 0,
      totalRevenue: response.total_revenue || 0
    };
  },

  // Get customer history (appointments, repairs, etc.)
  getCustomerHistory: async (customerId: string): Promise<CustomerHistory> => {
    const response = await apiGet<CustomerHistoryAPIResponse>(`/shop/customers/${customerId}/history/`);
    
    return {
      customerId,
      appointments: response.appointments || [],
      repairOrders: response.repair_orders || [],
      vehicles: response.vehicles || [],
      totalSpent: response.total_spent || 0,
      lastVisit: response.last_visit || null,
      visitCount: response.visit_count || 0
    };
  },

  // Export customers data
  exportCustomers: async (query: CustomerQuery = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.city) params.append('city', query.city);
    if (query.state) params.append('state', query.state);
    
    const response = await fetch(`/api/customers/export/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export customers');
    }
    
    return await response.blob();
  },

  // Import customers data
  importCustomers: async (file: File): Promise<{ success: number; errors: unknown[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/customers/import/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to import customers');
    }
    
    return await response.json();
  },

  // Get recent customers
  getRecentCustomers: async (limit: number = 10): Promise<Customer[]> => {
    const query: CustomerQuery = {
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    const response = await customerMngtService.getCustomers(query);
    return response.customers;
  }
};
