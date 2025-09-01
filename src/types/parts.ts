
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
export interface PartListResponse {
    results: PartResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PartResponse {
    id: number;
    name: string;
    part_number: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    cost: number;
    quantity: number;
    minimum_stock: number;
    location: string;
    is_active: boolean;
    shop_id: number |string;
    created_at: string;
    updated_at: string;
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