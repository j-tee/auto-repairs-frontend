import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Import backend-aligned Customer type
import type { Customer } from '../types/autoRepairs';

// Export Customer type for external use
export type { Customer } from '../types/autoRepairs';

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredContact?: 'email' | 'phone' | 'text';
}

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
  appointments: any[];
  repairOrders: any[];
  vehicles: any[];
  totalSpent: number;
  lastVisit: string | null;
  visitCount: number;
}

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

    const response = await apiGet<any>(`/shop/customers/?${params.toString()}`);
    
    // Handle different response structures - API might return array directly or wrapped
    const customerArray = Array.isArray(response) ? response : (response.results || response.customers || response || []);
    
    return {
      customers: customerArray.map((customer: any) => ({
        id: customer.id?.toString() || '',
        name: customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || '',
        email: customer.email || '',
        phone: customer.phone_number || customer.phone || '', // Handle both field names
        address: customer.address || '',
        city: customer.city,
        state: customer.state,
        zipCode: customer.zip_code,
        emergencyContact: customer.emergency_contact,
        emergencyPhone: customer.emergency_phone,
        preferredContact: customer.preferred_contact,
        isActive: customer.user?.is_active ?? true, // Get from User relationship
        createdAt: customer.created_at || new Date().toISOString(),
        updatedAt: customer.updated_at || new Date().toISOString()
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get customer by ID
  getCustomerById: async (customerId: string): Promise<Customer> => {
    const response = await apiGet<any>(`/shop/customers/${customerId}/`);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || `${response.first_name || ''} ${response.last_name || ''}`.trim() || '',
      email: response.email || '',
      phone: response.phone_number || response.phone || '', // Handle both field names
      address: response.address || '',
      city: response.city,
      state: response.state,
      zipCode: response.zip_code,
      emergencyContact: response.emergency_contact,
      emergencyPhone: response.emergency_phone,
      preferredContact: response.preferred_contact,
      isActive: response.user?.is_active ?? true, // Get from User relationship
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Create new customer
  createCustomer: async (customerData: CreateCustomerData): Promise<Customer> => {
    // Only send fields that exist in the database
    const createData: any = {
      name: customerData.name,
      phone_number: customerData.phone, // Map to phone_number field
    };
    
    // Add optional fields if they have values
    if (customerData.email) createData.email = customerData.email;
    if (customerData.address) createData.address = customerData.address;
    
    const response = await apiPost<any>('/shop/customers/', createData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      email: response.email || '',
      phone: response.phone_number || '', // Map from phone_number field
      address: response.address || '',
      city: '', // Not in database
      state: '', // Not in database
      zipCode: '', // Not in database
      emergencyContact: '', // Not in database
      emergencyPhone: '', // Not in database
      preferredContact: undefined, // Not in database
      isActive: true, // Default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Update customer
  updateCustomer: async (customerId: string, customerData: UpdateCustomerData): Promise<Customer> => {
    // Only send fields that exist in the database
    const updateData: any = {};
    
    if (customerData.name !== undefined) updateData.name = customerData.name;
    if (customerData.phone !== undefined) updateData.phone_number = customerData.phone; // Map to phone_number
    if (customerData.email !== undefined) updateData.email = customerData.email;
    if (customerData.address !== undefined) updateData.address = customerData.address;
    
    const response = await apiPut<any>(`/shop/customers/${customerId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      email: response.email || '',
      phone: response.phone_number || '', // Map from phone_number field
      address: response.address || '',
      city: '', // Not in database
      state: '', // Not in database
      zipCode: '', // Not in database
      emergencyContact: '', // Not in database
      emergencyPhone: '', // Not in database
      preferredContact: undefined, // Not in database
      isActive: true, // Default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Delete customer (hard delete - use with caution)
  deleteCustomer: async (customerId: string): Promise<void> => {
    await apiDelete(`/shop/customers/${customerId}/`);
  },

  // Deactivate customer (set User.is_active = false)
  deactivateCustomer: async (customerId: string): Promise<Customer> => {
    const response = await apiPut<any>(`/shop/customers/${customerId}/deactivate/`, {});
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      email: response.email || '',
      phone: response.phone_number || response.phone || '', // Handle both field names
      address: response.address || '',
      city: response.city,
      state: response.state,
      zipCode: response.zip_code,
      emergencyContact: response.emergency_contact,
      emergencyPhone: response.emergency_phone,
      preferredContact: response.preferred_contact,
      isActive: false, // Will be false after deactivation
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Activate customer (set User.is_active = true)
  activateCustomer: async (customerId: string): Promise<Customer> => {
    const response = await apiPut<any>(`/shop/customers/${customerId}/activate/`, {});
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      email: response.email || '',
      phone: response.phone_number || response.phone || '', // Handle both field names
      address: response.address || '',
      city: response.city,
      state: response.state,
      zipCode: response.zip_code,
      emergencyContact: response.emergency_contact,
      emergencyPhone: response.emergency_phone,
      preferredContact: response.preferred_contact,
      isActive: true, // Will be true after activation
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
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
    const response = await apiGet<any>('/shop/customers/stats/');
    
    return {
      totalCustomers: response.total_customers || 0,
      activeCustomers: response.active_customers || 0,
      inactiveCustomers: response.inactive_customers || 0,
      newCustomersThisMonth: response.new_customers_this_month || 0,
      averageVisitsPerCustomer: response.average_visits_per_customer || 0,
      totalRevenue: response.total_revenue || 0
    };
  },

  // Get customer history (appointments, repairs, etc.)
  getCustomerHistory: async (customerId: string): Promise<CustomerHistory> => {
    const response = await apiGet<any>(`/shop/customers/${customerId}/history/`);
    
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
  importCustomers: async (file: File): Promise<{ success: number; errors: any[] }> => {
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
