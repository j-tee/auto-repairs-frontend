import type { Customer, CustomerResponse, EmbeddedCustomer } from "./customers";
import type { Employee, EmployeeResponse } from "./employees";
import type { RepairOrder } from "./repairOrders";
import type { Shop } from "./shops";
import type {
  VehicleProblem,
  VehicleProblemResponse,
  VehicleResponse,
} from "./vehicles";

// NEW: Appointment status constants matching updated API workflow
export const APPOINTMENT_STATUSES = {
  PENDING: 'pending' as const,        // Customer booked appointment (initial status)
  ASSIGNED: 'assigned' as const,      // Technician assigned but not started
  IN_PROGRESS: 'in_progress' as const, // Work has begun
  COMPLETED: 'completed' as const,    // Work finished
  CANCELLED: 'cancelled' as const,    // Appointment cancelled
  NO_SHOW: 'no_show' as const        // Customer didn't show up
};

// NEW: Technician workload interfaces (technician is an Employee)
export interface TechnicianWorkload {
  technician: Employee;    // Employee with technician role
  workload: {
    current_appointments: number;
    is_available: boolean;
    appointments_today: number;
    max_capacity: number;
  };
  current_jobs: Array<{
    appointment_id: number;
    vehicle: string;
    customer: string;
    status: string;
    assigned_at: string;
    started_at: string | null;
  }>;
}

export interface TechnicianWorkloadSummary {
  total_technicians: number;
  available_technicians: number;
  busy_technicians: number;
  utilization_rate: string;
}

export interface TechnicianWorkloadResponse {
  summary: TechnicianWorkloadSummary;
  technicians: TechnicianWorkload[];
}

// Frontend TypeScript types for Appointments
// export interface VehicleProblem {
//   id: string;
//   vehicle: string;
//   description: string;
//   reported_date: string;
//   resolved: boolean;
// }

export interface AppointmentResponse {
  id?: string | number;
  assigned_technician_id?: string | number | null;
  assigned_technician?: EmployeeResponse | null;
  assigned_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  customer_id?: string | number;
  vehicle_id?: string | number;
  // vehicle?: VehicleResponse;
  date?: string;
  status?: string;
  description?: string;
  notes?: string;
  reported_problem_id?: string | number;
  service_type?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  duration?: number; // in minutes
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  reminder_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  checked_in?: boolean;
  checked_in_at?: string;
  technician?: EmployeeResponse;
  customer?: CustomerResponse | EmbeddedCustomer;
  vehicle?: VehicleResponse;
  reported_problem?: VehicleProblemResponse;
  // [key: string]:
  //   | string
  //   | number
  //   | boolean
  //   | undefined
  //   | CustomerResponse
  //   | EmbeddedCustomer
  //   | VehicleResponse
  //   | VehicleProblemResponse;
}
export interface Appointment {
  id?: string;
  customerId?: string;
  vehicleId?: string;
  employeeId?: string; // service advisor
  shopId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number; // in minutes
  serviceType?: string;
  description?: string;
  
  // Updated status with new workflow
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  priority?: "low" | "medium" | "high" | "urgent";
  estimatedCost?: number;
  notes?: string;
  reminderSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // NEW: Consistent API pattern - both ID and object fields
  vehicle_id?: number;           // Integer for relationships
  customer_id?: number;          // Integer for relationships
  customer_name?: string;        // Convenience field - no additional API call needed
  
  // NEW: Technician allocation fields (technician is an Employee)
  assigned_technician_id?: number | null;  // Employee ID
  assigned_technician?: Employee | null;   // Employee object for display
  
  // NEW: Timestamp tracking for workflow
  assigned_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  
  // Related data for display (updated to match API consistency)
  customer?: Customer | EmbeddedCustomer;
  employee?: Employee;
  shop?: Shop;
  vehicle?: {
    id?: number;
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;    // Updated to match API
    vin?: string;
    color?: string;
    customer?: {
      id?: number;
      name?: string;
      phone_number?: string;   // Updated to match API
      email?: string;
    };
  };
  reportedProblem?: VehicleProblem;
  date?: string; // ISO datetime
  createdAtAlt?: string; // was created_at
  updatedAtAlt?: string; // was updated_at
  //////////////////////////////////////////////////////////////////
  scheduledDate?: string;
  scheduledTime?: string;
  assignedTechnician?: string;
  reportedProblemId?: string; // Link to vehicle problem

  reportedProblemDetails?: {
    id?: string;
    description?: string;
    resolved?: boolean;
    reportedDate?: string;
  };
  technician?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    specialties?: string[];
  };
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface CreateAppointmentData {
  vehicle_id: string;
  reported_problem_id?: string;
  description?: string;
  date: string;
  status?: "pending";
  customerId?: string;
  vehicleId?: string;
  serviceType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  priority?: Appointment["priority"];
  notes?: string;
  estimatedCost?: number;
  assignedTechnician?: string;
  reportedProblemId?: string; // Link to vehicle problem
}

export interface UpdateAppointmentData {
  reported_problem_id?: string;
  description?: string;
  date?: string;
  // status?: 'pending' | 'pending' | 'completed' | 'cancelled';
  /////////////////////////////////////////////////
  customerId?: string;
  vehicleId?: string;
  serviceType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: Appointment["status"];
  priority?: Appointment["priority"];
  notes?: string;
  estimatedCost?: number;
  assignedTechnician?: string;
  reminderSent?: boolean;
  checkedIn?: boolean;
}

export interface AppointmentFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
}

// export interface RepairOrderFilters {
//   status?: RepairOrder["status"] | RepairOrder["status"][];
//   dateFrom?: string;
//   dateTo?: string;
//   customerId?: string;
//   vehicleId?: string;
//   technicianId?: string;
//   serviceAdvisorId?: string;
//   shopId?: string;
//   priority?: RepairOrder["priority"] | RepairOrder["priority"][];
//   minAmount?: number;
//   maxAmount?: number;
//   workOrderNumber?: string;
// }

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  status?: Appointment["status"];
  priority?: Appointment["priority"];
  dateFrom?: string;
  dateTo?: string;
  serviceType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined; // Index signature for API compatibility
}

export interface AppointmentList {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
  results?: Appointment[]; // Some APIs use 'results' key
}

export interface AppointmentListResponse {
  appointments: AppointmentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
  results?: AppointmentResponse[]; // Some APIs use 'results' key
}

export interface AppointmentStatsResponse {
  total_appointments: number;
  todays_appointments: number;  
  upcoming_appointments: number;
  completed_this_month: number;
  cancelled_this_month: number;
  average_duration: number;
  appointments_by_status: {
    scheduled: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  revenue_this_month: number;
}
export interface AppointmentStats {
  totalAppointments: number;
  todaysAppointments: number;
  upcomingAppointments: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
  averageDuration: number;
  appointmentsByStatus: {
    scheduled: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  revenueThisMonth: number;
}

export interface Slots{
date: string;
    time: string;
    available: boolean;
    duration: number;
    technician_id?: string;
}
export interface TimeSlotResponse {
  slots: Slots[];
}
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
  technicianId?: string;
}
