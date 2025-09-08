import type { Appointment } from "./appointments";
import type { Customer, CustomerResponse } from "./customers";
import type { Employee } from "./employees";
import type { Shop } from "./shops";
import type { Vehicle, VehicleResponse } from "./vehicles";

// Frontend TypeScript types for Repair Orders
export interface Service {
  id: string | number;
  shop: string | number;
  name: string;
  description?: string;
  labor_cost: string; // Decimal as string
  taxable: boolean;
  category?: string;
  price?: string; // Alternative price field (may be same as labor_cost)
  warranty_months: number;
}

export interface Part {
  id: string;
  shop: string;
  name: string;
  category: string;
  part_number: string;
  description?: string;
  manufacturer?: string;
  unit_price: string; // Decimal as string
  taxable: boolean;
  warranty_months: number;
  stock_quantity: number;
  created_at: string;
}

export interface RepairOrderPart {
  id: string;
  part: Part;
  quantity: number;
  warranty_override_months?: number;
  total_price: string; // Calculated field
}

export interface RepairOrderService {
  id: string;
  service: Service;
  warranty_override_months?: number;
}
export interface RepairOrderItemResponse {
  id: string;
  type: 'labor' | 'part' | 'sublet'| 'service';
  description: string;
  quantity: number;
  unit_price: string|number;
  total_price: string;
  part_number?: string;
  labor_code?: string;
  labor_hours?: number;
  taxable: boolean;
  warranty?: string;
  supplier_info?: string;
  created_at: string;
  updated_at: string;
  discount?: string | number;
  tax_rate?: string;
  notes?: string;
  repair_order_id?: number | string;
}
export interface RepairOrderItem {
  id: string;
  repairOrderId: string | number |undefined;
  type: 'labor' | 'part' | 'sublet'| 'service';
  description: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  partNumber?: string;
  laborCode?: string;
  laborHours?: number;
  taxable: boolean;
  warranty?: string;
  supplierInfo?: string;
  createdAt: string;
  updatedAt: string;
  discount?: number | string;
  taxRate?: number | string;
  notes?: string;
}

export interface RepairOrderDetailsResponse{
  id: number;
  customer_id: number;
  vehicle_id: number;
  appointment_id?: number; // Optional link to appointment
  order_number: string;
  status: "pending" | "created" | "waiting_parts" | "waiting_approval" | "completed" | "cancelled" | "pending" | "on_hold" ;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  diagnosis?: string;
  recommendations?: string;
  items: RepairOrderItemResponse[];
  subtotal:number;
  tax: number;
  discount: number;
  total: number;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  assigned_technician:string
  authorized_by:string
  authorized_at: string
  created_at: string;
  updated_at: string;
  started_at?: string;
  customer: CustomerResponse;
  vehicle: VehicleResponse;
  technician?: Employee;
  notes?: string;
  images?: string[];
  warranty: Warranty;
}
export interface RepairOrder {
  orderNumber?: string;
  recommendations?: string;
  items?: RepairOrderItem[];
  tax?: number;
  discount: number | string;
  total?: number;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  authorizedBy?: string;
  technician?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    specialties?: string[];
  };
  images?: string[];
  warranty?: {
    type?: string;
    duration?: number;
    description?: string;
  };
  ////////////////////////////////////////////////
  id?: string;
  customerId?: string;
  vehicleId?: string;
  appointmentId?: string; // Optional link to appointment
  assignedTechnicianId?: string;
  serviceAdvisorId?: string;
  shopId?: string;
  workOrderNumber?: string;
  status?: string;
  // status?:
  //   | "scheduled"
  //   | "confirmed"
  //   | "pending"
  //   | "completed"
  //   | "cancelled"
  //   | "no_show"
  //   | "in_progress";
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;

  // Descriptions and notes
  description?: string;
  customerComplaints?: string;
  diagnosis?: string;
  workPerformed?: string;
  recommendedServices?: string;
  internalNotes?: string;

  // Financial information
  laborHours?: number;
  laborRate?: number;
  partsTotal?: number;
  laborTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;

  // Vehicle condition
  mileageIn?: number;
  mileageOut?: number;
  fuelLevel?: string;
  vehicleCondition?: string;

  // Customer authorization
  customerSignature?: string;
  authorizedAt?: string;
  customerApprovalRequired?: boolean;

  // Related data for display
  customer?: Customer;
  vehicle?: Vehicle;
  appointment?: Appointment;
  assignedTechnician?: string;
  serviceAdvisor?: string;
  shop?: Shop;
  repairOrderItems?: RepairOrderItem[];
  services?: RepairOrderService[];
  parts?: RepairOrderPart[];
  // status: 'pending' | 'pending' | 'pending_parts' | 'on_hold' | 'completed' | 'cancelled';
  discount_amount?: string;
  discount_percent?: string;
  tax_percent?: string;
  total_cost?: string;
  date_created?: string;
  date_completed?: string;
  notes?: string;

  // Calculated fields
  subtotal?: string | number;
  tax_amount?: string;
  discount_value?: string;
}
///serviceAdvisorId, shopId, workOrderNumber, customerComplaints
export interface RepairJob {
  id: string;
  vehicleId: string;
  description: string;
  status?:
    | "scheduled"
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "no_show"
    | "in_progress";
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  completedAt?: string;
  mechanicId?: string;
}
export interface CreateRepairOrderData {
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  priority?: RepairOrder['priority'];
  description: string;
  diagnosis?: string;
  recommendations?: string;
  items?: Omit<RepairOrderItem, 'id'>[];
  estimatedCompletionDate?: string;
  assignedTechnician?: string;
  warranty?: RepairOrder['warranty'];
  ///////////////////////////////////
  vehicle_id: string;
  service_ids: string[];
  parts: Array<{
    part_id: string;
    quantity: number;
    warranty_override_months?: number;
  }>;
  status?: RepairOrder['status'];
  discount_amount?: string;
  discount_percent?: string;
  tax_percent?: string;
  notes?: string;
}

export interface UpdateRepairOrderData {
  customerId?: string;
  vehicleId?: string;
  // status?: RepairOrder['status'];
  priority?: RepairOrder['priority'];
  description?: string;
  diagnosis?: string;
  recommendations?: string;
  items?: RepairOrderItem[];
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedTechnician?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  // notes?: string;
  images?: string[];
  warranty?: RepairOrder['warranty'];
  ///////////////////////////////
  service_ids?: string[];
  parts?: Array<{
    part_id: string;
    quantity: number;
    warranty_override_months?: number;
  }>;
  status?: RepairOrder['status'];
  discount_amount?: string;
  discount_percent?: string;
  tax_percent?: string;
  notes?: string;
}

export interface RepairOrderFilters {
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
  // status?: RepairOrder['status'][];
  min_total?: string;
  max_total?: string;
  ////////////////////////////////////////////////
  status?: RepairOrder["status"] | RepairOrder["status"][];
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    vehicleId?: string;
    technicianId?: string;
    serviceAdvisorId?: string;
    shopId?: string;
    priority?: RepairOrder["priority"] | RepairOrder["priority"][];
    minAmount?: number;
    maxAmount?: number;
    workOrderNumber?: string;
}

export interface RepairOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  // Filters repair orders by their own status (e.g., 'pending', 'approved', etc.)
  status?: string; 
  priority?: RepairOrder['priority'];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
}
export interface RepairOrderListResponse {
  repairOrders: RepairOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
  results?: RepairOrderResponse[]; 
}
 export interface TopServiceResponse {
  service: string;
  count: number;
  revenue: number;
}
export interface RepairOrderStatsResponse {
  total_orders: number;
  active_orders: number;
  completed_this_month: number;
  total_revenue_this_month: number;
  average_order_value: number;
  orders_by_status: {
    in_progress: number;
    approved: number;
    pending: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
  top_services: TopServiceResponse[];
}
export interface RepairOrderStats {
  totalOrders: number;
  activeOrders: number;
  completedThisMonth: number;
  totalRevenueThisMonth: number;
  averageOrderValue: number;
  ordersByStatus: {
    in_progress: number;
    approved: number;
    pending: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
  topServices: { service: string; count: number; revenue: number }[];
}
////////////////////////////////////////////
export interface ItemResponse {
  id: string;
  type: 'labor' | 'part' | 'sublet' | 'service';
  description: string;
  quantity: number;
  unit_price: string|number;
  total_price: string;
  part_number?: string;
  labor_code?: string;
  labor_hours?: number;
  taxable: boolean;
  warranty?: string;
  supplier_info?: string;
  created_at: string;
  updated_at: string;
  discount?: string | number;
  tax_rate?: string;
  notes?: string;
  repair_order_id?: number;
}
export interface Item {
  id: string;
  type: 'labor' | 'part' | 'sublet' | 'service';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  partNumber?: string;
  laborCode?: string;
  laborHours?: number;
  taxable: boolean;
  warranty?: string;
  supplierInfo?: string;
  createdAt: string;
  updatedAt: string;
  discount?: number;
  taxRate?: number | string;
  notes?: string;
}

export interface Warranty {
  type: string;
  duration: number;
  description: string;
}
export interface RepairOrderResponse {
  results?: RepairOrderDetailsResponse[]; // For compatibility with paginated responses
  repair_orders: RepairOrderDetailsResponse[]; // For compatibility with paginated responses
  count?: number;
}

// export interface RepairHistory{
//   vehicleId: string;
//   history: RepairOrder[];
// }