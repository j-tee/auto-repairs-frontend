// Frontend TypeScript types for Repair Orders
export interface Service {
  id: string;
  shop: string;
  name: string;
  description?: string;
  labor_cost: string; // Decimal as string
  taxable: boolean;
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

export interface RepairOrder {
  id: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate?: string;
    vin: string;
    customer: {
      id: string;
      name: string;
      phone_number: string;
      email?: string;
    };
  };
  services: RepairOrderService[];
  parts: RepairOrderPart[];
  status: 'pending' | 'in_progress' | 'pending_parts' | 'on_hold' | 'completed' | 'cancelled';
  discount_amount: string;
  discount_percent: string;
  tax_percent: string;
  total_cost: string;
  date_created: string;
  date_completed?: string;
  notes?: string;
  
  // Calculated fields
  subtotal?: string;
  tax_amount?: string;
  discount_value?: string;
}

export interface CreateRepairOrderData {
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
  status?: RepairOrder['status'][];
  min_total?: string;
  max_total?: string;
}
