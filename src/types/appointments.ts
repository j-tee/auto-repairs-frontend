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
  description?: string;
  date: string; // ISO datetime
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
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
