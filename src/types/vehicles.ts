import type { Customer, CustomerResponse } from "./customers";

// Enhanced types to align with Django backend models
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  customerId: string;
  color?: string;
  mileage?: number;
  engine?: string;
  transmissionType?: 'manual' | 'automatic' | 'cvt';
  fuelType?:  'gasoline' | 'diesel' | 'hybrid' | 'electric';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  customer_id: string;
  color?: string;
  mileage?: number;
  engine?: string;
  transmission_type?: 'manual' | 'automatic' | 'cvt'; 
  fuel_type?:  'gasoline' | 'diesel' | 'hybrid' | 'electric';
  customer?: CustomerResponse;
  created_at: string;
  updated_at: string;
}

export interface VehicleProblemResponse {
  id?: string;
  vehicle_id: string;
  title: string;
  resolved: boolean;
  description: string;
  vehicle?: string; // vehicle ID
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  reported_date: string;
  resolved_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vehicle_details?: VehicleResponse; // Expanded vehicle details
}
export interface VehicleProblem {
  id: string;
  vehicleId: string;
  title?: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?:string;
  // status?:
  //   | "scheduled"
  //   | "confirmed"
  //   | "pending"
  //   | "completed"
  //   | "cancelled"
  //   | "no_show"
  //   | "in_progress";
  reportedDate?: string | number | Date;
  resolvedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  total?: number;
  // Related data
  vehicle?: Vehicle
  resolved?: boolean;
  resolutionNotes?: string;
}

export interface CreateVehicleProblemData {
  vehicleId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  notes?: string;
  vehicle_id: string;
  problem_description: string;
  date_reported?: string;
}

export interface UpdateVehicleProblemData {
  vehicleId?: string;
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?:string;
  // status?:
  //   | "scheduled"
  //   | "confirmed"
  //   | "pending"
  //   | "completed"
  //   | "cancelled"
  //   | "no_show"
  //   | "in_progress";
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  resolvedDate?: string;
  /////////
  problem_description?: string;
  resolved?: boolean;
  resolution_notes?: string;
}

export interface VehicleProblemQuery {
  vehicleId?: string;
  status?: string;
  // status?:
  //   | "scheduled"
  //   | "confirmed"
  //   | "pending"
  //   | "completed"
  //   | "cancelled"
  //   | "no_show"
  //   | "in_progress";
  severity?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  resolved?: boolean;
}
export interface VehicleProblemListResponse {
  problems: VehicleProblemResponse[];
  total: number;
  results: VehicleProblemResponse[]
  count: number;
}

export interface CreateVehicleData {
  customer_id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin: string;
  color?: string;
  mileage?: number;
  engine_size?: string;
  transmission_type?: Vehicle['transmissionType'];
  fuel_type?: Vehicle['fuelType'];
  notes?: string;
}


export interface UpdateVehicleData {
  customer_id?: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  vin?: string;
  color?: string;
  mileage?: number;
  engine_size?: string;
  transmission_type?: Vehicle['transmissionType'];
  fuel_type?: Vehicle['fuelType'];
  notes?: string;
}

export interface VehicleFilters {
  customer_id?: string;
  make?: string;
  model?: string;
  year_from?: number;
  year_to?: number;
  search?: string; // Search by make, model, license plate, or VIN
}

export interface VehicleProblemFilters {
  vehicle_id?: string;
  customer_id?: string;
  resolved?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface VehicleWithHistory extends Vehicle {
  problems: VehicleProblem[];
  total_appointments: number;
  total_repair_orders: number;
  last_service_date?: string;
}