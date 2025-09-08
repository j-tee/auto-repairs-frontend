import type { Customer, CustomerResponse, EmbeddedCustomer } from "./customers";
import type { Employee, EmployeeResponse } from "./employees";
import type { RepairOrder } from "./repairOrders";
import type { Shop } from "./shops";
import type {
  VehicleProblem,
  VehicleProblemResponse,
  VehicleResponse,
} from "./vehicles";

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
  customer_id?: string | number;
  vehicle_id?: string | number;
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
  status?: string;
  // status?:
  //   | "scheduled"
  //   | "confirmed"
  //   | "pending"
  //   | "completed"
  //   | "cancelled"
  //   | "no_show"
  //   | "in_progress";
  priority?: "low" | "medium" | "high" | "urgent";
  estimatedCost?: number;
  notes?: string;
  reminderSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Related data for display
  customer?: Customer | EmbeddedCustomer;
  employee?: Employee;
  shop?: Shop;
  vehicle?: {
    id?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    customer?: {
      id?: string;
      name?: string;
      phoneNumber?: string;
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
