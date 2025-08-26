/**
 * Vehicle Domain Types
 * Single source of truth for all vehicle-related type definitions
 */

import type { BaseAPIResponse } from "./api";
import type { Customer } from "./customers";

// Core Vehicle interface
export interface Vehicle {
  id: string;
  customerId: string | number;
  customer?: Customer; // Can be ID or full customer object
  customer_name?: string; // Backend-provided customer name
  customer_email?: string; // Backend-provided customer email
  customer_phone?: string; // Backend-provided customer phone
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  fuelType?: string;
  notes?: string;
  engine?: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  repairHistory?: ServiceRecord[];
  transmission?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Vehicle creation data
export interface CreateVehicleData {
  customerId: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  isActive?: boolean;
}

// Vehicle update data
export interface UpdateVehicleData {
  customerId?: number | string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  fuelType?: string;
  notes?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  isActive?: boolean;
}

export interface VehicleServiceHistory {
  id?: string;
    vehicleId: string | number;
  services: VehicleService[];
  totalRecords?: number;
  totalCost?: number;
  lastService?: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  maintenanceReminders?: MaintenanceReminder[];
}

// Consolidated service/repair record interface
// Represents both service records and repair history items for vehicles
export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  date: string; // Alternative date field for backward compatibility
  description: string;
  mileage?: number;
  cost: number;
  notes?: string;
  repairOrderId?: string;
}

// Vehicle query/filter parameters
export interface VehicleQuery {
  customer?: Customer
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
  isActive?: boolean;
  page?: number;
  customerId?: number | string;
  sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  serviceDue?: boolean;
  lastBerviceBefore?: string; // ISO date string
  lastBerviceAfter?: string; // ISO date string
}


// Vehicle API Responses
export interface VehicleAPIResponse extends BaseAPIResponse {
  customer_id: string | number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate: string;
  color?: string;
  engine?: string;
  transmission?: string;
  mileage?: number;
  fuel_type?: string;
  notes?: string;
  is_active: boolean;
  customer?: Customer
  last_service_date?: string;
  next_service_due?: string;
  repair_history?: ServiceRecord[];
}

// // Vehicle API response structure
// export interface VehicleAPIResponse {
//   id: number;
//   customer: number | Customer;
//   customer_name?: string;
//   customer_email?: string;
//   customer_phone?: string;
//   make: string;
//   model: string;
//   year: number;
//   vin: string;
//   license_plate?: string;
//   color?: string;
//   mileage?: number;
//   engine?: string;
//   transmission?: string;
//   created_at?: string;
//   updated_at?: string;
// }

// Vehicle list response
export interface VehicleListResponse {
  vehicles: Vehicle[];
  limit?: number;
  totalPages?: number;
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Vehicle filters for UI components
export interface VehicleFilters {
  search?: string;
  make?: string[];
  model?: string[];
  yearRange?: { min: number; max: number };
  customer?: number;
  isActive?: boolean;
}




// Vehicle maintenance record
export interface VehicleMaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceDate: string;
  mileage: number;
  serviceType: string;
  description: string;
  cost: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
}

// Vehicle stats/analytics
export interface VehicleStats {
    servicesDue?: number;
    averageMileage?: number;
    topMakes?: TopMakeItem[];
    recentlyAdded: VehicleSummary[];
    serviceDue?: VehicleSummary[];
  totalVehicles?: number;
  activeVehicles?: number;
  vehiclesByMake?: Record<string, number>;
  vehiclesByYear?: Record<string, number>;
  averageAge?: number;
  maintenanceOverdue?: number;
}

// Vehicle inspection data
export interface VehicleInspection {
  id: string;
  vehicleId: string;
  inspectionDate: string;
  inspector: string;
  mileage: number;
  status: 'passed' | 'failed' | 'conditional';
  findings: string[];
  recommendations: string[];
  nextInspectionDate?: string;
}
export interface VehicleSummary {    
  id: number | string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin: string;
  color?: string;
  customer?: Customer
}

export interface VehicleProblemSummary {
  id: number;
  description: string;
  resolved: boolean;
  reported_date: string; // ISO datetime
  severity?: VehicleProblemSeverity;
  status?: VehicleProblemStatus;
}

export interface VehicleService {
  id: string;
  name: string;
  description: string;
  lastPerformed?: string;
  nextDue?: string;
  intervalMiles?: number;
  intervalMonths?: number;
}

export interface MaintenanceReminder {
  id: string;
  type: string;
  description: string;
  dueDate: string;
  dueMileage?: number;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

export interface TopMakeItem {
  make: string;
  count: number;
  percentage?: number;
}

export interface VehicleRawData {
  id: number | string;
  customer_id: number | string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  color?: string;
  engine?: string;
  transmission?: string;
  mileage?: number;
  fuel_type?: string;
  notes?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number | string;
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    phone?: string;
  };
  last_service_date?: string;
  next_service_due?: string;
  repair_history?: ServiceRecord[];
}


export interface VehicleListAPIResponse {
  count?: number;
  results?: VehicleAPIResponse[];
  vehicles?: VehicleAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface VehicleStatsAPIResponse {
  total_vehicles: number;
  active_vehicles: number;
  services_due?: number;
  average_mileage?: number;
  by_make: Array<{
    make: string;
    count: number;
  }>;
  top_makes?: Array<{
    make: string;
    count: number;
  }>;
  topMakes: Array<{
    make: string;
    count: number;
  }>;
  recently_added?: VehicleAPIResponse[];
  recentlyAdded: VehicleAPIResponse[];
  service_due: VehicleAPIResponse[];
}

export interface VehicleServiceHistoryAPIResponse {
  vehicle_id: string;
  services?: VehicleService[];
  service_records: ServiceRecord[];
  total_records: number;
  total_cost?: number;
  last_service?: string;
  last_service_date?: string;
  next_service_due?: string;
  maintenance_reminders?: MaintenanceReminder[];
}

// Vehicle Problem Types - Consolidated from vehicleProblems.ts and vehicleProblemMngtService.ts

// Customer information in vehicle problem context
export interface VehicleCustomer {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  user: number | null;
}

// Vehicle information in problem context
export interface VehicleInProblem {
  id: number;
  customer: VehicleCustomer;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  color: string;
}

// Core Vehicle Problem interface - unified from both service and UI needs
export interface VehicleProblem {
  id: string | number; // Support both string and number IDs
  vehicle?: number | string | VehicleInProblem; // Can be ID or full vehicle object
  vehicleId?: string | number; // Alternative field name
  title?: string;
  description: string;
  reported_date?: string;
  reportedDate?: string; // Alternative field name
  resolved?: boolean;
  date_resolved?: string;
  dateResolved?: string; // Alternative field name
  resolvedDate?: string;
  resolution_notes?: string;
  resolutionNotes?: string; // Alternative field name
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTechnicianId?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Vehicle Problem creation data
export interface CreateVehicleProblemData {
  vehicle?: number;
  vehicle_id?: number; // Alternative field name
  vehicleId?: string; // Frontend naming convention
  title?: string;
  description: string;
  resolved?: boolean;
  severity?: VehicleProblem['severity'];
  category?: string;
  priority?: VehicleProblem['priority'];
  assignedTechnicianId?: string;
  estimatedCost?: number;
  notes?: string;
}

// Vehicle Problem update data
export interface UpdateVehicleProblemData {
  vehicle?: number;
  vehicleId?: string;
  title?: string;
  description?: string;
  resolved?: boolean;
  resolution_notes?: string;
  severity?: VehicleProblem['severity'];
  category?: string;
  priority?: VehicleProblem['priority'];
  status?: VehicleProblem['status'];
  assignedTechnicianId?: string;
  estimatedCost?: number;
  actualCost?: number;
  resolvedDate?: string;
  notes?: string;
}

// Vehicle Problem query/filter parameters
export interface VehicleProblemQuery {
  vehicle?: number;
  vehicleId?: string;
  customer?: number;
  resolved?: boolean;
  severity?: VehicleProblem['severity'];
  category?: string;
  priority?: VehicleProblem['priority'];
  status?: VehicleProblem['status'];
  assigned_technician?: string;
  date_from?: string;
  date_to?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

// Vehicle Problem API response structure
export interface VehicleProblemAPIResponse {
  id: number;
  vehicle: VehicleInProblem;
  description: string;
  reported_date: string;
  resolved: boolean;
  date_resolved?: string;
  resolution_notes?: string;
  severity?: string;
  category?: string;
  priority?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Problem list response
export interface VehicleProblemListResponse {
  vehicleProblems?: VehicleProblem[];
  results?: VehicleProblemAPIResponse[];
  count: number;
  total?: number;
  next?: string | null;
  previous?: string | null;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Vehicle Problem list API response (backend format)
export interface VehicleProblemListAPIResponse {
  results: VehicleProblemAPIResponse[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Vehicle Problem create request
export interface VehicleProblemCreateRequest {
  vehicle_id: number;
  description: string;
  resolved?: boolean;
  severity?: string;
  category?: string;
  priority?: string;
}

// Vehicle Problem filters for UI components
export interface VehicleProblemFilters {
  search?: string;
  resolved?: boolean;
  severity?: VehicleProblem['severity'][];
  category?: string[];
  priority?: VehicleProblem['priority'][];
  status?: VehicleProblem['status'][];
  dateRange?: { from?: string; to?: string };
  vehicle?: number;
  customer?: number;
  assignedTechnician?: string;
}

// Vehicle Problem with extended details
export interface VehicleProblemWithDetails extends VehicleProblem {
  vehicleInfo: string; // e.g., "2020 Toyota Camry"
  customerName: string;
  customerPhone: string;
  technicianName?: string;
  relatedRepairOrders?: string[];
  estimatedRepairTime?: number;
  actualRepairTime?: number;
}

// Vehicle Problem stats/analytics
export interface VehicleProblemStats {
  totalProblems: number;
  openProblems: number;
  resolvedProblems: number;
  problemsBySeverity: Record<NonNullable<VehicleProblem['severity']>, number>;
  problemsByCategory: Record<string, number>;
  averageResolutionTime: number;
  topProblematicVehicles: Array<{
    vehicleId: string;
    vehicleInfo: string;
    problemCount: number;
  }>;
}

// Vehicle Problem timeline entry
export interface VehicleProblemTimelineEntry {
  id: string;
  problemId: string;
  timestamp: string;
  action: string;
  description: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

// Type aliases for convenience
export type VehicleProblemSeverity = VehicleProblem['severity'];
export type VehicleProblemPriority = VehicleProblem['priority'];
export type VehicleProblemStatus = VehicleProblem['status'];

export const COMMON_VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
  'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Ram',
  'Jeep', 'Chrysler', 'Dodge', 'Mitsubishi', 'Volvo', 'Jaguar', 'Land Rover'
] as const;

export type VehicleMake = typeof COMMON_VEHICLE_MAKES[number] | string;
