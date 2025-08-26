/**
 * Appointment Domain Types
 * Single source of truth for all appointment-related type definitions
 */

import type { Customer, CustomerSummary } from "./customers";
import type { VehicleProblem, VehicleProblemSummary, VehicleSummary } from "./vehicles";



// Core Appointment interface - unified from both service and UI needs
export interface Appointment {
  id: string | number; // Support both string and number IDs
  vehicle: VehicleSummary
  reported_problem?: VehicleProblem;
  date: string; // ISO datetime
  time?: string; // Time field for appointments
  serviceType?: string;
  created_at?: string;
  updated_at?: string;
  cancelReason?: string;
  completionNotes?: string;
    // id: string;
    customerId: string;
    vehicleId: string;
    employeeId: string; // Not in backend, keeping for UI compatibility
    shopId: string; // Not in backend, keeping for UI compatibility
    // serviceType: string; // Not in backend, keeping for UI compatibility
    scheduledDate: string; // Parsed from backend's 'date' field
    scheduledTime: string; // Parsed from backend's 'date' field
    appointmentDate: string; // Alias for scheduledDate
    appointmentTime: string; // Alias for scheduledTime
    duration: number; // Default 60 minutes (not in backend)
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending';
    priority: 'low' | 'medium' | 'high' | 'urgent'; // Not in backend, keeping for UI compatibility
    description: string;
    notes?: string; // Alias for description
    estimatedCost?: number; // Not in backend, keeping for UI compatibility
    assignedTechnician?: string; // Not in backend, keeping for UI compatibility
    reminderSent?: boolean; // Not in backend, keeping for UI compatibility
    createdAt: string;
    updatedAt: string;
    reportedProblemId?: string;
    customer?: CustomerSummary | Customer;
    reportedProblem?: VehicleProblemSummary;
    technician?: {
      id: string;
      firstName: string;
      lastName: string;
      specialties: string[];
    }; // Not in backend, keeping for UI compatibility
    checkedIn?: boolean; // Not in backend, keeping for UI compatibility
    checkedInAt?: string; // Not in backend, keeping for UI compatibility
  
}

// Appointment creation data
export interface CreateAppointmentData {
  customerId?: string | number;
  vehicleId?: string | number;
  scheduledDate?: string; // Alternative field name
  scheduledTime?: string; // Alternative field name
  reportedProblemId?: string | number;
  vehicle?: number;
  vehicle_id?: string | number; // Alternative field name
  reported_problem?: number;
  reported_problem_id?: string | number; // Alternative field name
  description?: string;
  date: string;
  time?: string;
  duration?: number;
  serviceType?: string;
  priority?: Appointment['priority'];
  estimatedCost?: number;
  notes?: string;
  status?: 'pending' | 'scheduled';
}

// Appointment update data
export interface UpdateAppointmentData {
  vehicleId?: string | number;
  vehicle?: VehicleSummary;
  reported_problem?: VehicleProblem;
  reported_problem_id?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: number;
  status?: Appointment['status'];
  priority?: Appointment['priority'];
  serviceType?: string;
  estimatedCost?: number;
  notes?: string;
  cancelReason?: string;
  completionNotes?: string;
  scheduledDate?: string; // Alternative field name
  scheduledTime?: string; // Alternative field name
}

// Appointment query/filter parameters
export interface AppointmentQuery {
  vehicle?: number;
  customer?: number;
  status?: Appointment['status'] | Appointment['status'][];
  priority?: Appointment['priority'];
  date_from?: string;
  date_to?: string;
  service_type?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
  employee?: number;
  shop?: number;
  customer_id?: string;
  vehicle_id?: string;
}

// Appointment filters for UI components
export interface AppointmentFilters {
  status?: Appointment['status'][];
  priority?: Appointment['priority'][];
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
  service_type?: string[];
  search?: string;
}

// Appointment API response structure
export interface AppointmentAPIResponse {
  id: number;
  description?: string;
  date: string; // ISO datetime (single field, not separate date/time)
  status: "pending" | "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  priority?: "low" | "medium" | "high" | "urgent";
  service_type?: string;
  estimated_cost?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer_id: number;
  customer: CustomerSummary;
  vehicle_id: number;
  vehicle: VehicleSummary;
  reported_problem_id?: number;
  reported_problem?: VehicleProblemSummary;
  time?: string;
  duration?: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  limit?: number;
  offset?: number;
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Appointment with extended details
export interface AppointmentWithDetails extends Appointment {
  customerName: string;
  customerPhone: string;
  vehicleInfo: string; // e.g., "2020 Toyota Camry"
  serviceAdvisor?: string;
  estimatedDuration: number;
  actualDuration?: number;
  followUpRequired?: boolean;
}

// Appointment scheduling slots
export interface AppointmentSlot {
  date: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  conflictingAppointments?: string[];
}

// Appointment reminder settings
export interface AppointmentReminder {
  appointmentId: string;
  reminderType: 'email' | 'sms' | 'call';
  scheduledTime: string;
  sent: boolean;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

// Appointment stats/analytics
// export interface AppointmentStats {
//   totalAppointments: number;
//   completedAppointments: number;
//   cancelledAppointments: number;
//   noShowAppointments: number;
//   appointmentsByStatus: Record<Appointment['status'], number>;
//   appointmentsByPriority: Record<NonNullable<Appointment['priority']>, number>;
//   averageDuration: number;
//   onTimePercentage: number;
// }

export interface AppointmentStats {
  total_appointments: number;
  todays_appointments: number;
  upcoming_appointments: number;
  completed_this_month: number;
  appointments_by_status: Array<{
    status: string;
    count: number;
  }>;
  this_week_count: number;
}
// Appointment timeline/schedule view
export interface AppointmentSchedule {
  date: string;
  slots: AppointmentSlot[];
  appointments: Appointment[];
  capacity: number;
  utilization: number;
}

// Service type definitions
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  category: string;
// (Removed duplicate interface, merged above)
  reported_problem_id?: number;
  reported_problem?: VehicleProblemSummary;
}

export interface AppointmentListAPIResponse {
  count: number;
  next?: string;
  previous?: string;
  results: AppointmentAPIResponse[];
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
  technicianId?: string;
}

export interface AvailableSlotsAPIResponse {
  slots?: TimeSlot[];
}

export interface CreateAppointmentAPIData {
  vehicle_id: number;
  description?: string;
  date: string; // ISO datetime
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reported_problem_id?: number;
}

export type AppointmentStatus = Appointment['status'];
export type AppointmentPriority = Appointment['priority'];
