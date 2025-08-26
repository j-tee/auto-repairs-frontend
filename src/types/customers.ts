/**
 * Customer Domain Types
 * Single source of truth for all customer-related type definitions
 */

import type { BaseAPIResponse } from "./api";

// Core Customer interface - unified from both service and UI needs

// Customer API Responses
export interface CustomerAPIResponse extends BaseAPIResponse {
  first_name: string;
  last_name: string;
  name?: string; // Computed field (first_name + last_name)
  email: string;
  phone?: string;
  phone_number?: string; // Alternative field name
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  is_active: boolean;
  user?: {
    id: string;
    is_active: boolean;
  };
  appointments?: unknown[];
  repairOrders?: unknown[];
  vehicles?: unknown[];
}

export interface CustomerListAPIResponse {
  count?: number;
  results?: CustomerAPIResponse[];
  customers?: CustomerAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CustomerStatsAPIResponse {
  total_customers: number;
  active_customers: number;
  inactive_customers?: number;
  new_customers_this_month?: number;
  new_this_month: number;
  average_visits_per_customer?: number;
  total_revenue?: number;
  top_customers: Array<{
    id: string;
    name: string;
    total_spent: number;
  }>;
}

export interface CustomerHistoryAPIResponse {
  customer_id: string;
  appointments?: unknown[];
  repair_orders?: unknown[];
  vehicles?: unknown[];
  total_spent?: number;
  last_visit?: string;
  visit_count?: number;
}

export interface CustomerRawData {
  id: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  is_active?: boolean;
  user?: {
    id: string;
    is_active: boolean;
  };
  created_at?: string;
  updated_at?: string;
}
export interface Customer {
  id: string | number; // Support both string and number IDs
  shop?: number;
  name: string;
  phone_number?: string;
  phone?: string; // Alternative field name
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  is_active?: boolean;
  date_created?: string;
  created_at?: string; // Alternative field name
  updated_at?: string;
  
  // Extended fields for UI compatibility
  firstName?: string;
  lastName?: string;
  fullName?: string;
  customerSince?: string;
  totalSpent?: number;
  loyaltyPoints?: number;
  notes?: string;
}

// Customer creation data
export interface CreateCustomerData {
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  notes?: string;
}

// Customer update data
export interface UpdateCustomerData {
  name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_contact?: 'email' | 'phone' | 'text';
  is_active?: boolean;
  notes?: string;
}

// Customer query/filter parameters
export interface CustomerQuery {
  search?: string; // Search by name, phone, or email
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
  preferred_contact?: 'email' | 'phone' | 'text';
  city?: string;
  state?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

// Customer filters for UI components
export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  city?: string[];
  state?: string[];
  preferredContact?: ('email' | 'phone' | 'text')[];
  customerSince?: { from?: string; to?: string };
  totalSpentRange?: { min?: number; max?: number };
}

// // Customer API response structure
// export interface CustomerAPIResponse {
//   id: number;
//   name?: string;
//   phone_number?: string;
//   email?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   zip_code?: string;
//   emergency_contact?: string;
//   emergency_phone?: string;
//   preferred_contact?: 'email' | 'phone' | 'text';
//   is_active: boolean;
//   date_created: string;
//   updated_at: string;
// }

// Customer list response
export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Customer with associated data
export interface CustomerWithDetails extends Customer {
  vehicles: CustomerVehicle[];
  totalVehicles: number;
  totalAppointments: number;
  totalRepairOrders: number;
  lastServiceDate?: string;
  accountBalance?: number;
  preferredTechnician?: string;
}

// Simplified vehicle info for customer context
export interface CustomerVehicle {
  id: string | number;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  isActive: boolean;
}

// Customer stats/analytics
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customersByState: Record<string, number>;
  customersByPreferredContact: Record<string, number>;
  averageCustomerValue: number;
  topCustomers: Customer[];
}

// Customer communication preferences
export interface CustomerCommunicationPreferences {
  customerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  serviceCompletionAlerts: boolean;
  promotionalMessages: boolean;
  preferredLanguage: string;
}

// Customer feedback/reviews
export interface CustomerFeedback {
  id: string;
  customerId: string;
  rating: number; // 1-5 stars
  comment?: string;
  serviceDate: string;
  repairOrderId?: string;
  category: 'service_quality' | 'timeliness' | 'pricing' | 'communication' | 'overall';
  createdAt: string;
}

// Customer loyalty program
export interface CustomerLoyalty {
  customerId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  totalEarned: number;
  totalRedeemed: number;
  expiringPoints: { amount: number; expireDate: string }[];
}
export interface CustomerSummary {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'suspended';
export type CustomerTier = 'new' | 'regular' | 'premium' | 'vip';
