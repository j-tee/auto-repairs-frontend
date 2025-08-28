
// API Response interfaces
export interface PartAPIResponse {
  id: number | string;
  name: string;
  part_number?: string;
  partNumber?: string;
  description: string;
  brand: string;
  category: string;
  price: string | number;
  cost: string | number;
  quantity: string | number;
  minimum_stock?: number;
  minimumStock?: number;
  location: string;
  is_active?: boolean;
  shop_id?: number | string;
  shop?: number | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface PartListResponse {
  results?: PartAPIResponse[];
  count?: number;
  next?: string;
  previous?: string;
}

// Part types
export interface Part {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minimumStock: number;
  location: string;
  isActive: boolean;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartData {
  name: string;
  partNumber: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minimumStock: number;
  location: string;
  shopId: string;
  isActive?: boolean;
}

export interface UpdatePartData {
  name?: string;
  partNumber?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minimumStock?: number;
  location?: string;
  shopId?: string;
  isActive?: boolean;
}

export interface PartQuery {
  search?: string;
  category?: string;
  brand?: string;
  shopId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  limit?: number;
  offset?: number;
}