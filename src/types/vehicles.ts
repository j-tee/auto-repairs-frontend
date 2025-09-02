import type { CustomerResponse } from "./customers";
import type { RepairOrder } from "./repairOrders";
import type { ServiceResponse } from "./services";

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
  transmission?: 'manual' | 'automatic' | 'cvt';
  fuelType?:  'gasoline' | 'diesel' | 'hybrid' | 'electric';
  createdAt: string;
  updatedAt: string;
  //////////////////////////////////////////////////////////////////////////////
  notes?: string;
  isActive: boolean;
  customer?: {
    id: string;
    name: string; // Combined firstName + lastName from backend
    email: string;
    phone: string;
  };
  lastServiceDate?: string;
  nextServiceDue?: string;
  repairHistory?: RepairOrder[];
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
  transmission?: 'manual' | 'automatic' | 'cvt'; 
  fuel_type?:  'gasoline' | 'diesel' | 'hybrid' | 'electric';
  customer?: CustomerResponse;
  created_at: string;
  updated_at: string;
  notes?: string;
  is_active: boolean;
  last_service_date?: string;
  next_service_due?: string;
  repair_history?: RepairOrder[];
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
  page?: number;
  customerId?: string;
  make?: string;
  year?: number;
  model?: string;
  isActive?: boolean;
  sortBy?: 'reportedDate' | 'severity' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  serviceDue?: boolean;
  lastServiceBefore?: string;
  lastServiceAfter?: string;
}

export interface VehicleListResponse {
  vehicles: VehicleResponse[];
  total: number;
  results: VehicleResponse[]
  count: number;
}
export interface VehicleList{
  vehicles: Vehicle[];
  results?: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
}
export interface VehicleProblemListResponse {
  problems: VehicleProblemResponse[];
  total: number;
  results: VehicleProblemResponse[]
  count: number;
}

export interface VehicleProblemList {
  vehicles: VehicleProblem[];
  results?: VehicleProblem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
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
  transmission?: Vehicle['transmission'];
  fuel_type?: Vehicle['fuelType'];
  notes?: string;
  engine?: string;
  //////////////////////////////////////////////////////////////////////////
  customerId: string;
  licensePlate: string;
}
export interface VehicleQuery{
  customerId?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  search?: string; // Search by make, model, license plate, or VIN
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  transmission?: Vehicle['transmission'];
  fuel_type?: Vehicle['fuelType'];
  notes?: string;
  engine?: string;
  is_active?: boolean;
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

export interface TopMake  { make: string; count: number }
export interface VehicleStatsResponse {
  total_vehicles: number;
  active_vehicles: number;
  services_due: number;
  average_mileage: number;
  top_makes: { make: string; count: number }[];
  recently_added: VehicleResponse[];
}

export interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  servicesDue: number;
  averageMileage: number;
  topMakes: { make: string; count: number }[];
  recentlyAdded: Vehicle[];
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  serviceType: string;
  dueDate: string;
  mileageDue?: number;
  notes?: string;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface VehicleServiceHistoryResponse {
  vehicle_id: string;
  services: ServiceResponse[]; // Replace 'any' with actual service type if available
  total_cost: number;
  last_service?: string;
  next_service_due?: string;
  maintenance_reminders: MaintenanceReminder[]; // Replace 'any' with actual reminder type if available
}
export interface VehicleServiceHistory {
  vehicleId: string;
  services: ServiceResponse[];
  totalCost: number;
  lastService?: string;
  nextServiceDue?: string;
  maintenanceReminders: MaintenanceReminder[];
}
