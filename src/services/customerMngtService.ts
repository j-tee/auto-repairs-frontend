import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Customer types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalSpent?: number;
  lastVisit?: string;
  vehicleCount?: number;
  preferences?: {
    preferredContactMethod: 'email' | 'phone' | 'sms';
    reminderPreferences: string[];
    specialRequests?: string;
  };
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  notes?: string;
  preferences?: Customer['preferences'];
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  isActive?: boolean;
  preferences?: Customer['preferences'];
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  hasVehicles?: boolean;
  lastVisitAfter?: string;
  lastVisitBefore?: string;
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
  newThisMonth: number;
  totalRevenue: number;
  averageSpending: number;
  topCustomers: Customer[];
}

export interface CustomerHistory {
  vehicles: any[];
  appointments: any[];
  repairOrders: any[];
  totalSpent: number;
  lastVisit?: string;
  visitCount: number;
}

// Customer Management Service
export const customerMngtService = {
  // Get all customers with filtering and pagination
  getCustomers: async (query: CustomerQuery = {}): Promise<CustomerListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);
    if (query.hasVehicles !== undefined) params.append('has_vehicles', query.hasVehicles.toString());
    if (query.lastVisitAfter) params.append('last_visit_after', query.lastVisitAfter);
    if (query.lastVisitBefore) params.append('last_visit_before', query.lastVisitBefore);
    
    const queryString = params.toString();
    const endpoint = `/customers/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    
    return {
      customers: response.results?.map((customer: any) => ({
        id: customer.id?.toString() || '',
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        dateOfBirth: customer.date_of_birth,
        notes: customer.notes,
        isActive: customer.is_active ?? true,
        createdAt: customer.created_at || new Date().toISOString(),
        updatedAt: customer.updated_at || new Date().toISOString(),
        totalSpent: customer.total_spent || 0,
        lastVisit: customer.last_visit,
        vehicleCount: customer.vehicle_count || 0,
        preferences: customer.preferences ? {
          preferredContactMethod: customer.preferences.preferred_contact_method || 'email',
          reminderPreferences: customer.preferences.reminder_preferences || [],
          specialRequests: customer.preferences.special_requests
        } : undefined
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get customer by ID
  getCustomerById: async (customerId: string): Promise<Customer> => {
    const response = await apiGet<any>(`/customers/${customerId}/`);
    
    return {
      id: response.id?.toString() || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      email: response.email || '',
      phone: response.phone || '',
      address: response.address || '',
      dateOfBirth: response.date_of_birth,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      totalSpent: response.total_spent || 0,
      lastVisit: response.last_visit,
      vehicleCount: response.vehicle_count || 0,
      preferences: response.preferences ? {
        preferredContactMethod: response.preferences.preferred_contact_method || 'email',
        reminderPreferences: response.preferences.reminder_preferences || [],
        specialRequests: response.preferences.special_requests
      } : undefined
    };
  },

  // Create new customer
  createCustomer: async (customerData: CreateCustomerData): Promise<Customer> => {
    const createData = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      date_of_birth: customerData.dateOfBirth,
      notes: customerData.notes,
      preferences: customerData.preferences ? {
        preferred_contact_method: customerData.preferences.preferredContactMethod,
        reminder_preferences: customerData.preferences.reminderPreferences,
        special_requests: customerData.preferences.specialRequests
      } : undefined
    };
    
    const response = await apiPost<any>('/customers/', createData);
    
    return {
      id: response.id?.toString() || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      email: response.email || '',
      phone: response.phone || '',
      address: response.address || '',
      dateOfBirth: response.date_of_birth,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      totalSpent: response.total_spent || 0,
      lastVisit: response.last_visit,
      vehicleCount: response.vehicle_count || 0,
      preferences: response.preferences ? {
        preferredContactMethod: response.preferences.preferred_contact_method || 'email',
        reminderPreferences: response.preferences.reminder_preferences || [],
        specialRequests: response.preferences.special_requests
      } : undefined
    };
  },

  // Update customer
  updateCustomer: async (customerId: string, customerData: UpdateCustomerData): Promise<Customer> => {
    const updateData = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      date_of_birth: customerData.dateOfBirth,
      notes: customerData.notes,
      is_active: customerData.isActive,
      preferences: customerData.preferences ? {
        preferred_contact_method: customerData.preferences.preferredContactMethod,
        reminder_preferences: customerData.preferences.reminderPreferences,
        special_requests: customerData.preferences.specialRequests
      } : undefined
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/customers/${customerId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      email: response.email || '',
      phone: response.phone || '',
      address: response.address || '',
      dateOfBirth: response.date_of_birth,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      totalSpent: response.total_spent || 0,
      lastVisit: response.last_visit,
      vehicleCount: response.vehicle_count || 0,
      preferences: response.preferences ? {
        preferredContactMethod: response.preferences.preferred_contact_method || 'email',
        reminderPreferences: response.preferences.reminder_preferences || [],
        specialRequests: response.preferences.special_requests
      } : undefined
    };
  },

  // Delete customer
  deleteCustomer: async (customerId: string): Promise<void> => {
    await apiDelete(`/customers/${customerId}/`);
  },

  // Deactivate customer
  deactivateCustomer: async (customerId: string): Promise<Customer> => {
    return await customerMngtService.updateCustomer(customerId, { isActive: false });
  },

  // Activate customer
  activateCustomer: async (customerId: string): Promise<Customer> => {
    return await customerMngtService.updateCustomer(customerId, { isActive: true });
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
    const response = await apiGet<any>('/customers/stats/');
    
    return {
      totalCustomers: response.total_customers || 0,
      activeCustomers: response.active_customers || 0,
      newThisMonth: response.new_this_month || 0,
      totalRevenue: response.total_revenue || 0,
      averageSpending: response.average_spending || 0,
      topCustomers: response.top_customers?.map((customer: any) => ({
        id: customer.id?.toString() || '',
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        dateOfBirth: customer.date_of_birth,
        notes: customer.notes,
        isActive: customer.is_active ?? true,
        createdAt: customer.created_at || new Date().toISOString(),
        updatedAt: customer.updated_at || new Date().toISOString(),
        totalSpent: customer.total_spent || 0,
        lastVisit: customer.last_visit,
        vehicleCount: customer.vehicle_count || 0,
        preferences: customer.preferences ? {
          preferredContactMethod: customer.preferences.preferred_contact_method || 'email',
          reminderPreferences: customer.preferences.reminder_preferences || [],
          specialRequests: customer.preferences.special_requests
        } : undefined
      })) || []
    };
  },

  // Get customer history
  getCustomerHistory: async (customerId: string): Promise<CustomerHistory> => {
    const response = await apiGet<any>(`/customers/${customerId}/history/`);
    
    return {
      vehicles: response.vehicles || [],
      appointments: response.appointments || [],
      repairOrders: response.repair_orders || [],
      totalSpent: response.total_spent || 0,
      lastVisit: response.last_visit,
      visitCount: response.visit_count || 0
    };
  },

  // Export customers
  exportCustomers: async (query: CustomerQuery = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.hasVehicles !== undefined) params.append('has_vehicles', query.hasVehicles.toString());
    if (query.lastVisitAfter) params.append('last_visit_after', query.lastVisitAfter);
    if (query.lastVisitBefore) params.append('last_visit_before', query.lastVisitBefore);
    
    const queryString = params.toString();
    const endpoint = `/customers/export/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return await response.blob();
  },

  // Import customers
  importCustomers: async (file: File): Promise<{ success: number; errors: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/customers/import/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Import failed');
    }
    
    return await response.json();
  },

  // Get recent customers
  getRecentCustomers: async (limit: number = 10): Promise<Customer[]> => {
    const query: CustomerQuery = {
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    
    const response = await customerMngtService.getCustomers(query);
    return response.customers;
  }
};
