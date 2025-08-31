
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
  transmission?: string;
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
  transmission?: string;
  created_at: string;
  updated_at: string;
}