import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// API Response interfaces
interface PartAPIResponse {
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

interface PartListResponse {
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

// Utility functions for safe type conversion
const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

const safeParseInt = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Parts Management Service
export const partMngtService = {
  // Get all parts
  getParts: async (query: PartQuery = {}): Promise<Part[]> => {
    const params = new URLSearchParams();
    
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.brand) params.append('brand', query.brand);
    if (query.shopId) params.append('shop_id', query.shopId);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.lowStock) params.append('low_stock', query.lowStock.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    
    const endpoint = `/shop/parts/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiGet<PartListResponse | PartAPIResponse[]>(endpoint);
    
    // Handle both paginated and non-paginated responses
    const parts = Array.isArray(response) ? response : (response.results || []);
    
    return parts.map((part: PartAPIResponse): Part => ({
      id: part.id?.toString() || '',
      name: part.name || '',
      partNumber: part.part_number || part.partNumber || '',
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      price: safeParseFloat(part.price),
      cost: safeParseFloat(part.cost),
      quantity: safeParseInt(part.quantity),
      minimumStock: safeParseInt(part.minimum_stock || part.minimumStock),
      location: part.location || '',
      isActive: part.is_active ?? true,
      shopId: part.shop_id?.toString() || part.shop?.toString() || '',
      createdAt: part.created_at || part.createdAt || new Date().toISOString(),
      updatedAt: part.updated_at || part.updatedAt || new Date().toISOString()
    }));
  },

  // Get part by ID
  getPartById: async (partId: string): Promise<Part> => {
    const response = await apiGet<PartAPIResponse>(`/shop/parts/${partId}/`);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || response.partNumber || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: safeParseFloat(response.price),
      cost: safeParseFloat(response.cost),
      quantity: safeParseInt(response.quantity),
      minimumStock: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || response.shop?.toString() || '',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString()
    };
  },

  // Create new part
  createPart: async (partData: CreatePartData): Promise<Part> => {
    const createData = {
      name: partData.name,
      part_number: partData.partNumber,
      description: partData.description,
      brand: partData.brand,
      category: partData.category,
      price: partData.price,
      cost: partData.cost,
      quantity: partData.quantity,
      minimum_stock: partData.minimumStock,
      location: partData.location,
      shop_id: partData.shopId,
      is_active: partData.isActive ?? true
    };
    
    const response = await apiPost<PartAPIResponse>('/shop/parts/', createData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || response.partNumber || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: safeParseFloat(response.price),
      cost: safeParseFloat(response.cost),
      quantity: safeParseInt(response.quantity),
      minimumStock: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || response.shop?.toString() || '',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString()
    };
  },

  // Update part
  updatePart: async (partId: string, partData: UpdatePartData): Promise<Part> => {
    const updateData: Partial<PartAPIResponse> = {};
    
    if (partData.name !== undefined) updateData.name = partData.name;
    if (partData.partNumber !== undefined) updateData.part_number = partData.partNumber;
    if (partData.description !== undefined) updateData.description = partData.description;
    if (partData.brand !== undefined) updateData.brand = partData.brand;
    if (partData.category !== undefined) updateData.category = partData.category;
    if (partData.price !== undefined) updateData.price = partData.price;
    if (partData.cost !== undefined) updateData.cost = partData.cost;
    if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
    if (partData.minimumStock !== undefined) updateData.minimum_stock = partData.minimumStock;
    if (partData.location !== undefined) updateData.location = partData.location;
    if (partData.shopId !== undefined) updateData.shop_id = partData.shopId;
    if (partData.isActive !== undefined) updateData.is_active = partData.isActive;
    
    const response = await apiPut<PartAPIResponse>(`/shop/parts/${partId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || response.partNumber || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: safeParseFloat(response.price),
      cost: safeParseFloat(response.cost),
      quantity: safeParseInt(response.quantity),
      minimumStock: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || response.shop?.toString() || '',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString()
    };
  },

  // Delete part
  deletePart: async (partId: string): Promise<void> => {
    await apiDelete(`/shop/parts/${partId}/`);
  },

  // Get low stock parts
  getLowStockParts: async (shopId?: string): Promise<Part[]> => {
    const endpoint = `/shop/parts/low_stock/${shopId ? `?shop_id=${shopId}` : ''}`;
    const response = await apiGet<PartListResponse | PartAPIResponse[]>(endpoint);
    
    const parts = Array.isArray(response) ? response : (response.results || []);
    
    return parts.map((part: PartAPIResponse): Part => ({
      id: part.id?.toString() || '',
      name: part.name || '',
      partNumber: part.part_number || part.partNumber || '',
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      price: safeParseFloat(part.price),
      cost: safeParseFloat(part.cost),
      quantity: safeParseInt(part.quantity),
      minimumStock: safeParseInt(part.minimum_stock || part.minimumStock),
      location: part.location || '',
      isActive: part.is_active ?? true,
      shopId: part.shop_id?.toString() || part.shop?.toString() || '',
      createdAt: part.created_at || part.createdAt || new Date().toISOString(),
      updatedAt: part.updated_at || part.updatedAt || new Date().toISOString()
    }));
  },

  // Get parts by shop
  getPartsByShop: async (shopId: string): Promise<Part[]> => {
    return partMngtService.getParts({ shopId });
  },

  // Get parts by category
  getPartsByCategory: async (category: string): Promise<Part[]> => {
    return partMngtService.getParts({ category });
  }
};
