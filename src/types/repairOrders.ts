/**
 * Repair Order Domain Types
 * Single source of truth for all repair order-related type definitions
 */

import type { BaseAPIResponse } from "./api";
import type { Vehicle, VehicleSummary } from "./vehicles";

// Frontend interfaces - transformed from backend data
export interface RepairOrderItem {
  id: number;
  type: 'labor' | 'part' | 'service';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  partNumber?: string;
  notes?: string;
}

// Repair Order API Responses
export interface RepairOrderAPIResponse extends BaseAPIResponse {
  order_number: string;
  customer_id: string;
  vehicle_id: string;
  employee_id?: string;
  shop_id: string;
  status: string;
  priority: string;
  description: string;
  estimated_cost?: number;
  actual_cost?: number;
  labor_hours?: number;
  start_date?: string;
  completion_date?: string;
  notes?: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    type: 'part' | 'service';
  }>;
  id: number;
  vehicle: Vehicle;
  discount_amount: string;
  discount_percent: string;
  tax_percent: string;
  total_cost: string;
  date_created: string;
  repair_order_parts: RepairOrderPart[];
  repair_order_services: RepairOrderService[];
  calculated_total_cost: string;
  services: unknown[]; // Empty array from M2M relationship
  parts: unknown[];    // Empty array from M2M relationship
}

export interface RepairOrderListAPIResponse {
  count?: number;
  results?: RepairOrderAPIResponse[];
  repairOrders?: RepairOrderAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  next: string | null;
  previous: string | null;
}

export interface RepairOrderStatsAPIResponse {
  total_orders: number;
  active_orders: number;
  completed_this_month: number;
  revenue_this_month: number;
  average_completion_time: number;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}
// Core Service interface
export interface Service {
  id: string;
  shop: number;
  name: string;
  description?: string;
  labor_cost: string; // Decimal as string
  price?: string; // Alternative price field
  taxable: boolean;
  warranty_months: number;
  category?: string;
}

// Core Part interface
export interface Part {
  id: string;
  shop: number;
  name: string;
  category: string;
  part_number: string;
  description?: string;
  manufacturer?: string;
  unit_price: string; // Decimal as string
  taxable: boolean;
  warranty_months: number;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
  reorder_level?: number;
  location?: string;
  notes?: string;
  is_active?: boolean;
  last_ordered_at?: string;
  total_sold?: number;
  total_cost?: string;
}

// Repair Order Part association
export interface RepairOrderPart {
  id: string;
  part: Part;
  quantity: number;
  warranty_override_months?: number;
  total_price?: string; // Calculated field
  repair_order?: number;
}

// Repair Order Service association
export interface RepairOrderService {
  id: string | number;
  service: Service;
  warranty_override_months?: number;
  repair_order: number;
}

// Core Repair Order interface - unified from both service and UI needs
export interface RepairOrder {
  id: string | number; // Support both string and number IDs
  customerId: number | string;
  vehicleId: number | string;
  orderNumber: string;
  status: 'pending' | 'in_progress' | 'pending_parts' | 'on_hold' | 'completed' | 'cancelled';
  items: RepairOrderItem[];
  subtotal: string | number;
  tax: number;
  discount: number;
  total: number;
  total_cost: string;
  createdAt: string;
  
  vehicle: number | {
    id: string | number;
    make: string;
    model: string;
    year: number;
    license_plate?: string;
    vin: string;
    customer: {
      id: string | number;
      name: string;
      phone_number: string;
      email?: string;
    };
  };
  
  customer: {
    id: number | string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  
  services?: number[] | RepairOrderService[]; // Can be IDs or full objects
  parts?: number[] | RepairOrderPart[]; // Can be IDs or full objects
  discount_amount?: string;
  discount_percent?: string;
  tax_percent?: string;
  date_created?: string;
  created_date?: string; // Alternative field name
  date_completed?: string;
  notes?: string;
  
  // Extended fields for UI compatibility
  workOrderNumber?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  diagnosis?: string;
  serviceAdvisorId?: string;
  shopId?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  customerComplaints?: string;
  
  // Calculated fields
  tax_amount?: string;
  discount_value?: string;
}

export interface CreateRepairOrderData {
  vehicle?: VehicleSummary;
  service_ids?: string[] | number[];
  services?: number[];
  parts?: Array<{
    part: number;
    part_id?: string;
    quantity: number;
    warranty_override_months?: number;
  }>;
  status?: RepairOrder['status'];
  discount_amount?: string | number;
  discount_percent?: string | number;
  tax_percent?: string | number;
  notes?: string;
}

export interface UpdateRepairOrderData {
  vehicleId?: number;
  vehicele?: VehicleSummary;
  service_ids?: string[] | number[];
  services?: number[];
  parts?: Array<{
    part: number;
    part_id?: string;
    quantity: number;
    warranty_override_months?: number;
  }>;
  status?: RepairOrder['status'];
}

// Repair Order query/filter parameters
export interface RepairOrderQuery {
  vehicle?: number;
  status?: RepairOrder['status'] | RepairOrder['status'][];
  date_from?: string;
  date_to?: string;
  customer?: number;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
  customer_id?: number;
  vehicle_id?: number;
  [key: string]: string | number | string[] | undefined;
}

// UI Filter interface
export interface RepairOrderFilters {
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
  status?: RepairOrder['status'][];
  min_total?: string;
  max_total?: string;
  priority?: RepairOrder['priority'][];
  search?: string;
}

// Repair Order list response
export interface RepairOrderListResponse {
  repairOrders?: RepairOrder[];
  repair_orders?: RepairOrder[];
  results?: RepairOrder[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Advanced repair order completion types
export interface CompleteWorkData {
  notes?: string;
  completion_notes?: string; // Alternative field name
  completionImages?: string[];
  technicianId?: string;
  timeSpent?: number;
  target_appointment_id?: string;
}

export interface AddServiceData {
  serviceId: string;
  description: string;
  price: number;
  laborHours?: number;
}

export interface AddPartData {
  partId: string;
  partNumber: string;
  quantity: number;
  price: number;
}

export interface CostBreakdown {
  labor: number;
  parts: number;
  total: number;
  tax: number;
  discount?: number;
}

// Extended cost breakdown with additional fields needed by UI
export interface RepairOrderCostBreakdown extends CostBreakdown {
  current_state?: string;
  started_at?: string;
  completed_at?: string;
  labor_costs?: Array<{
    id: string;
    description: string;
    hours: number;
    rate: number;
    total: number;
  }>;
  parts_costs?: Array<{
    id: string;
    name: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totals?: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  related_appointments?: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    description: string;
  }>;
}

// Related appointments response
export interface RelatedAppointmentsResponse {
  appointments: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    description: string;
  }>;
  total: number;
}

export interface WorkmanshipAnalytics {
  averageTime: number;
  successRate: number;
  customerSatisfaction: number;
}

// Repair Order stats/analytics
export interface RepairOrderStats {
  totalRepairOrders: number;
  completedRepairOrders: number;
  pendingRepairOrders: number;
  inProgressRepairOrders: number;
  averageCompletionTime: number;
  totalRevenue: number;
  ordersByStatus: Record<RepairOrder['status'], number>;
}

// Repair Order timeline/history
export interface RepairOrderTimelineEntry {
  id: string;
  repairOrderId: string;
  timestamp: string;
  action: string;
  description: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

export type RepairOrderStatus = RepairOrder['status'];
export type RepairOrderPriority = RepairOrder['priority'];
