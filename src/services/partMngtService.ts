import type { Part } from '../types';
import type { PartAPIResponse, PartListResponse, PartQuery, CreatePartData, UpdatePartData } from '../types/parts';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { safeParseFloat, safeParseInt } from '../utils/safe-conversion';


// // Utility functions for safe type conversion
// const safeParseFloat = (value: string | number | undefined | null): number => {
//   if (value === null || value === undefined) return 0;
//   const parsed = parseFloat(String(value));
//   return isNaN(parsed) ? 0 : parsed;
// };

// const safeParseInt = (value: string | number | undefined | null): number => {
//   if (value === null || value === undefined) return 0;
//   const parsed = parseInt(String(value), 10);
//   return isNaN(parsed) ? 0 : parsed;
// };

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
      part_number: part.part_number || part.partNumber || '',
      description: part.description || '',
      manufacturer: part.brand || '',
      category: part.category || '',
      unit_price: safeParseFloat(part.price).toString(),
      total_cost: safeParseFloat(part.cost).toString(),
      stock_quantity: safeParseInt(part.quantity),
      reorder_level: safeParseInt(part.minimum_stock || part.minimumStock),
      location: part.location || '',
      is_active: part.is_active ?? true,
      shop: parseInt((part.shop_id || part.shop || 0).toString(), 10),
      created_at: part.created_at || part.createdAt || new Date().toISOString(),
      updated_at: part.updated_at || part.updatedAt || new Date().toISOString(),
      taxable: true, // Default value
      warranty_months: 0 // Default value
    }));
  },

  // Get part by ID
  getPartById: async (partId: string): Promise<Part> => {
    const response = await apiGet<PartAPIResponse>(`/shop/parts/${partId}/`);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      part_number: response.part_number || response.partNumber || '',
      description: response.description || '',
      manufacturer: response.brand || '',
      category: response.category || '',
      unit_price: safeParseFloat(response.price).toString(),
      total_cost: safeParseFloat(response.cost).toString(),
      stock_quantity: safeParseInt(response.quantity),
      reorder_level: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      is_active: response.is_active ?? true,
      shop: parseInt((response.shop_id || response.shop || 0).toString(), 10),
      created_at: response.created_at || response.createdAt || new Date().toISOString(),
      updated_at: response.updated_at || response.updatedAt || new Date().toISOString(),
      taxable: true, // Default value
      warranty_months: 0 // Default value
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
      part_number: response.part_number || response.partNumber || '',
      description: response.description || '',
      manufacturer: response.brand || '',
      category: response.category || '',
      unit_price: safeParseFloat(response.price).toString(),
      total_cost: safeParseFloat(response.cost).toString(),
      stock_quantity: safeParseInt(response.quantity),
      reorder_level: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      is_active: response.is_active ?? true,
      shop: parseInt((response.shop_id || response.shop || 0).toString(), 10),
      created_at: response.created_at || response.createdAt || new Date().toISOString(),
      updated_at: response.updated_at || response.updatedAt || new Date().toISOString(),
      taxable: true, // Default value
      warranty_months: 0 // Default value
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
      part_number: response.part_number || response.partNumber || '',
      description: response.description || '',
      manufacturer: response.brand || '',
      category: response.category || '',
      unit_price: safeParseFloat(response.price).toString(),
      total_cost: safeParseFloat(response.cost).toString(),
      stock_quantity: safeParseInt(response.quantity),
      reorder_level: safeParseInt(response.minimum_stock || response.minimumStock),
      location: response.location || '',
      is_active: response.is_active ?? true,
      shop: parseInt((response.shop_id || response.shop || 0).toString(), 10),
      created_at: response.created_at || response.createdAt || new Date().toISOString(),
      updated_at: response.updated_at || response.updatedAt || new Date().toISOString(),
      taxable: true, // Default value
      warranty_months: 0 // Default value
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
      part_number: part.part_number || part.partNumber || '',
      description: part.description || '',
      manufacturer: part.brand || '',
      category: part.category || '',
      unit_price: safeParseFloat(part.price).toString(),
      total_cost: safeParseFloat(part.cost).toString(),
      stock_quantity: safeParseInt(part.quantity),
      reorder_level: safeParseInt(part.minimum_stock || part.minimumStock),
      location: part.location || '',
      is_active: part.is_active ?? true,
      shop: parseInt((part.shop_id || part.shop || 0).toString(), 10),
      created_at: part.created_at || part.createdAt || new Date().toISOString(),
      updated_at: part.updated_at || part.updatedAt || new Date().toISOString(),
      taxable: true, // Default value
      warranty_months: 0 // Default value
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
