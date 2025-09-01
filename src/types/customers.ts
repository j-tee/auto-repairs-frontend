// Frontend TypeScript types for Customers and Vehicles

import type { Appointment } from "./appointments";
import type { RepairOrder } from "./repairOrders";
import type { UserResponse } from "./userManagement";
import type { Vehicle } from "./vehicles";

export interface Customer {
  id: string;
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
  isActive: boolean; // Derived from User.is_active through user relationship
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  is_active: boolean; // Derived from User.is_active through user relationship
  created_at: string;
  updated_at: string;
  user?:UserResponse;
}
export interface EmbeddedCustomer {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address?: string;
}

// Data transfer objects for API operations
export interface CreateCustomerData {
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
}

export interface CustomerHistory {
  customerId: string;
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  vehicles: Vehicle[];
  totalSpent: number;
  lastVisit: string | null;
  visitCount: number;
}

export interface CustomerHistoryResponse {
  customer_id: string;
  appointments: Appointment[];
  repair_orders: RepairOrder[];
  vehicles: Vehicle[];
  total_spent: number;
  last_visit: string | null;
  visit_count: number;
}
export interface CustomerStatsResponse {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  new_customers_this_month: number;
  average_visits_per_customer: number;
  total_revenue: number;
}
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  averageVisitsPerCustomer: number;
  totalRevenue: number;
}
export interface CustomerListView {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface CustomerListResponse {
  customers?: CustomerResponse[];
  count?:number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data?:CustomerResponse[];
  results?: CustomerResponse[]; // Some APIs use 'results' key
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
export interface UpdateCustomerData {
  name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredContact?: 'email' | 'phone' | 'text';
  isActive?: boolean; // Can be updated through User relationship
}
// export interface CreateVehicleProblemData {
//   vehicle_id: string;
//   problem_description: string;
//   date_reported?: string;
// }

// export interface UpdateVehicleProblemData {
//   problem_description?: string;
//   resolved?: boolean;
//   resolution_notes?: string;
// }

// Filters for API queries
export interface CustomerFilters {
  search?: string; // Search by name, phone, or email
  date_from?: string;
  date_to?: string;
}

// export interface VehicleFilters {
//   customer_id?: string;
//   make?: string;
//   model?: string;
//   year_from?: number;
//   year_to?: number;
//   search?: string; // Search by make, model, license plate, or VIN
// }

// export interface VehicleProblemFilters {
//   vehicle_id?: string;
//   customer_id?: string;
//   resolved?: boolean;
//   date_from?: string;
//   date_to?: string;
// }

// Response types for API calls
export interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[];
  total_vehicles: number;
}

