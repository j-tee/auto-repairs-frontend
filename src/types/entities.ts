// Backend entity types based on Django models

// User and authentication-related types
export interface User {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'owner' | 'employee' | 'customer';
  is_active?: boolean;
  date_joined?: string;
}

export interface UserProfile {
  user: number; // Foreign key to User
  phone_number?: string;
  address?: string;
  profile_picture?: string; // URL to profile picture
}

export interface Shop {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id?: number;
  shop: number; // Foreign key to Shop
  name: string;
  role: string;
  phone_number: string;
  email?: string;
  picture?: string;
  user?: number; // Foreign key to User
}

export interface Customer {
  id?: number;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  user?: number; // Foreign key to User
}





export interface Service {
  id?: number;
  shop: number; // Foreign key to Shop
  name: string;
  description?: string;
  category?: string; // Service category
  labor_cost: string; // Decimal field as string
  price?: string; // Alternative price field (may be same as labor_cost)
  taxable: boolean;
  warranty_months: number;
}

export interface Part {
  id?: number;
  shop: number; // Foreign key to Shop
  name: string;
  category: string;
  part_number: string;
  description?: string;
  manufacturer?: string;
  unit_price: string; // Decimal field as string
  taxable: boolean;
  warranty_months: number;
  stock_quantity: number;
  created_at?: string;
}

export interface Appointment {
  id?: number;
  vehicle: number; // Foreign key to Vehicle
  reported_problem?: number; // Foreign key to VehicleProblem
  description?: string;
  date: string;
  time?: string; // Time field for appointments
  service?: number; // Foreign key to Service
  notes?: string; // Notes field for appointments
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface RepairOrder {
  id?: number;
  vehicle: number; // Foreign key to Vehicle
  services: number[]; // Many-to-many through RepairOrderService
  parts: number[]; // Many-to-many through RepairOrderPart
  discount_amount: string; // Decimal field as string
  discount_percent: string; // Decimal field as string
  tax_percent: string; // Decimal field as string
  total_cost: string; // Decimal field as string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; // Status field
  date_created?: string;
  created_date?: string; // Alternative date field name
  notes?: string;
}

export interface RepairOrderPart {
  id?: number;
  repair_order: number; // Foreign key to RepairOrder
  part: number; // Foreign key to Part
  quantity: number;
  warranty_override_months?: number;
}

export interface RepairOrderService {
  id?: number;
  repair_order: number; // Foreign key to RepairOrder
  service: number; // Foreign key to Service
  warranty_override_months?: number;
}

// Form data types for creating new entities
export interface ShopFormData {
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export interface EmployeeFormData {
  shop: number;
  name: string;
  role: string;
  phone_number: string;
  email?: string;
  picture?: File;
}

export interface CustomerFormData {
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
}

export interface VehicleFormData {
  customer: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate?: string;
  color?: string;
}

export interface VehicleProblemFormData {
  vehicle: number;
  description: string;
  resolved?: boolean;
}

export interface ServiceFormData {
  shop: number;
  name: string;
  description?: string;
  labor_cost: number;
  taxable: boolean;
  warranty_months: number;
}

export interface PartFormData {
  shop: number;
  name: string;
  category: string;
  part_number: string;
  description?: string;
  manufacturer?: string;
  unit_price: number;
  taxable: boolean;
  warranty_months: number;
  stock_quantity: number;
}

export interface AppointmentFormData {
  vehicle: number;
  reported_problem?: number;
  description?: string;
  date: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface RepairOrderFormData {
  vehicle: number;
  services: number[];
  parts: Array<{ part: number; quantity: number; warranty_override_months?: number }>;
  discount_amount?: number;
  discount_percent?: number;
  tax_percent?: number;
  notes?: string;
}
