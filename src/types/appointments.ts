import type { Customer } from "./customers";
import type { Employee } from "./employees";
import type { RepairOrder } from "./repairOrders";
import type { Shop } from "./shops";

// Frontend TypeScript types for Appointments
export interface VehicleProblem {
  id: string;
  vehicle: string;
  description: string;
  reported_date: string;
  resolved: boolean;
}

export interface Appointment {
id: string;
  customerId: string;
  vehicleId: string;
  employeeId: string; // service advisor
  shopId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  serviceType: string;
  description: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost?: number;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  // Related data for display
  customer?: Customer;
  employee?: Employee;
  shop?: Shop;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate?: string;
    customer: {
      id: string;
      name: string;
      phone_number: string;
      email?: string;
    };
  };
  reported_problem?: VehicleProblem;
  date: string; // ISO datetime
  created_at?: string;
  updated_at?: string;
}

export interface CreateAppointmentData {
  vehicle_id: string;
  reported_problem_id?: string;
  description?: string;
  date: string;
  status?: 'pending';
}

export interface UpdateAppointmentData {
  reported_problem_id?: string;
  description?: string;
  date?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface AppointmentFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  vehicle_id?: string;
}


export interface RepairOrderFilters {
  status?: RepairOrder['status'] | RepairOrder['status'][];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  serviceAdvisorId?: string;
  shopId?: string;
  priority?: RepairOrder['priority'] | RepairOrder['priority'][];
  minAmount?: number;
  maxAmount?: number;
  workOrderNumber?: string;
}
