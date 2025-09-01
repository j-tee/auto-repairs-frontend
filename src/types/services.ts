
// Service types and categories
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // in minutes
  basePrice: number;
  isActive: boolean;
}

// Service types (matching entities.ts)
export interface Service {
  id?: number;
  shop: number; // Foreign key to Shop
  name: string;
  description?: string;
  category?: string; // Service category
  labor_cost: string; // Decimal field as string
  price?: string; // Alternative price field (may be same as labor_cost)
  taxable: boolean;
  warranty_months: number;
}

export interface ServiceListResponse {
  results: Service[];
  count: number;
  next?: string;
  previous?: string;
  totalPages: number;
}

export interface ServiceResponse{
  id?: number | string;
  shop: number; // Foreign key to Shop
  name: string;
  description?: string;
  category?: string; // Service category
  labor_cost: string; // Decimal field as string
  price?: string; // Alternative price field (may be same as labor_cost)
  taxable: boolean;
  warranty_months: number;
}

export interface CreateServiceData {
  shop: number;
  name: string;
  description?: string;
  category?: string;
  labor_cost: string;
  price?: string;
  taxable?: boolean;
  warranty_months?: number;
}

export interface UpdateServiceData {
  shop?: number;
  name?: string;
  description?: string;
  category?: string;
  labor_cost?: string;
  price?: string;
  taxable?: boolean;
  warranty_months?: number;
}

export interface ServiceQuery {
  search?: string;
  category?: string;
  shop?: number;
  limit?: number;
  offset?: number;
}