// Frontend TypeScript types for Customers and Vehicles

export interface Customer {
  id: string;
  shop: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  date_created: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  customer: {
    id: string;
    name: string;
    phone_number: string;
    email?: string;
  };
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin: string;
  color?: string;
  mileage?: number;
  engine_size?: string;
  transmission_type?: 'manual' | 'automatic' | 'cvt';
  fuel_type?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  date_created: string;
  updated_at: string;
  notes?: string;
}

export interface VehicleProblem {
  id: string;
  vehicle: string; // Vehicle ID
  problem_description: string;
  date_reported: string;
  resolved: boolean;
  date_resolved?: string;
  resolution_notes?: string;
}

// Data transfer objects for API operations
export interface CreateCustomerData {
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
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
  transmission_type?: Vehicle['transmission_type'];
  fuel_type?: Vehicle['fuel_type'];
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
  transmission_type?: Vehicle['transmission_type'];
  fuel_type?: Vehicle['fuel_type'];
  notes?: string;
}

export interface CreateVehicleProblemData {
  vehicle_id: string;
  problem_description: string;
  date_reported?: string;
}

export interface UpdateVehicleProblemData {
  problem_description?: string;
  resolved?: boolean;
  resolution_notes?: string;
}

// Filters for API queries
export interface CustomerFilters {
  search?: string; // Search by name, phone, or email
  date_from?: string;
  date_to?: string;
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

// Response types for API calls
export interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[];
  total_vehicles: number;
}

export interface VehicleWithHistory extends Vehicle {
  problems: VehicleProblem[];
  total_appointments: number;
  total_repair_orders: number;
  last_service_date?: string;
}
