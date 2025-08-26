/**
 * Shop Domain Types
 * Single source of truth for all shop-related type definitions
 */

import type { BaseAPIResponse } from "./api";

// Shop API Responses
export interface ShopAPIResponse extends BaseAPIResponse {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email?: string;
  manager_id?: string;
  is_active: boolean;
  operating_hours?: Record<string, { open: string; close: string; closed?: boolean }>;
  services?: string[];
}

export interface ShopListAPIResponse {
  count?: number;
  results?: ShopAPIResponse[];
  shops?: ShopAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ShopStatsAPIResponse {
  total_shops: number;
  active_shops: number;
  revenue_this_month: number;
  recentActivity: unknown[];
  upcomingAppointments: unknown[];
  lowInventoryItems: unknown[];
  employeePerformance: unknown[];
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  availableSlots: Array<{
    time: string;
    available: boolean;
  }>;
  busySlots: Array<{
    time: string;
    available: boolean;
  }>;
}
// Core Shop interface - unified from both service and UI needs
export interface Shop {
  id: string | number; // Support both string and number IDs
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  zip_code?: string; // Alternative field name
  phone: string;
  email?: string;
  website?: string;
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  services?: string[];
  taxId?: string;
  licenseNumber?: string;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string; // Alternative field name
  updated_at?: string;
  updatedAt?: string; // Alternative field name
}

// Shop creation data
export interface CreateShopData {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone: string;
  email?: string;
  website?: string;
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  services?: string[];
  taxId?: string;
  licenseNumber?: string;
}

// Shop update data
export interface UpdateShopData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  services?: string[];
  taxId?: string;
  licenseNumber?: string;
  isActive?: boolean;
}

// Shop query/filter parameters
export interface ShopQuery {
  search?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
  ordering?: string;
  limit?: number;
  offset?: number;
}

// // Shop API response structure
// export interface ShopAPIResponse {
//   id: number;
//   name: string;
//   address: string;
//   city?: string;
//   state?: string;
//   zip_code?: string;
//   phone: string;
//   email?: string;
//   website?: string;
//   created_at: string;
//   updated_at: string;
// }

// Shop list response
export interface ShopListResponse {
  shops: Shop[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Shop filters for UI components
export interface ShopFilters {
  search?: string;
  city?: string[];
  state?: string[];
  isActive?: boolean;
}

// Shop with statistics
export interface ShopWithStats extends Shop {
  totalEmployees: number;
  totalCustomers: number;
  totalVehicles: number;
  totalRepairOrders: number;
  monthlyRevenue: number;
  averageJobTime: number;
  customerSatisfaction: number;
}

// Shop statistics/analytics
export interface ShopStats {
  totalShops: number;
  activeShops: number;
  shopsByState: Record<string, number>;
  totalRevenue: number;
  averageRevenue: number;
  topPerformingShops: ShopWithStats[];
}

// Shop operating hours structure
export interface OperatingHours {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
}

// Shop service offerings
export interface ShopService {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  laborHours: number;
  isActive: boolean;
}

// Shop equipment/resources
export interface ShopEquipment {
  id: string;
  shopId: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  maintenanceSchedule?: string;
  isOperational: boolean;
}

// Shop performance metrics
export interface ShopPerformance {
  shopId: string;
  period: string; // e.g., '2024-01', 'Q1-2024'
  totalJobs: number;
  completedJobs: number;
  averageJobTime: number;
  revenue: number;
  profitMargin: number;
  customerSatisfaction: number;
  employeeUtilization: number;
}

// Shop capacity planning
export interface ShopCapacity {
  shopId: string;
  date: string;
  totalBays: number;
  availableBays: number;
  scheduledJobs: number;
  estimatedCapacity: number;
  utilizationPercentage: number;
}

export type ShopStatus = 'active' | 'inactive' | 'maintenance' | 'closed';
export type ShopType = 'full_service' | 'quick_lube' | 'specialty' | 'dealership';
