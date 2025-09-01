import type { CreatePartData, Part, PartListResponse, PartQuery, PartResponse, UpdatePartData } from '../types/parts';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';


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
    
    const endpoint = `/parts/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiGet<PartListResponse>(endpoint);
    
    // Handle both paginated and non-paginated responses
    const parts = response.results || response;
    
    return parts.map((part: PartResponse): Part => ({
      id: part.id?.toString() || '',
      name: part.name || '',
      partNumber: part.part_number || '',
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      price: (part.price) || 0,
      cost: (part.cost) || 0,
      quantity: (part.quantity) || 0,
      minimumStock: part.minimum_stock || 0,
      location: part.location || '',
      isActive: part.is_active ?? true,
      shopId: part.shop_id?.toString() || '',
      createdAt: part.created_at || new Date().toISOString(),
      updatedAt: part.updated_at || new Date().toISOString()
    }));
  },

  // Get part by ID
  getPartById: async (partId: string): Promise<Part> => {
    const response = await apiGet<PartResponse>(`/parts/${partId}/`);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: (response.price) || 0,
      cost: (response.cost) || 0,
      quantity: (response.quantity) || 0,
      minimumStock: response.minimum_stock || 0,
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || '',
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
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
    
    const response = await apiPost<PartResponse>('/shop/parts/', createData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: (response.price) || 0,
      cost: (response.cost) || 0,
      quantity: (response.quantity) || 0,
      minimumStock: (response.minimum_stock) || 0,
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || '',
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Update part
  updatePart: async (partId: string, partData: UpdatePartData): Promise<Part> => {
    const updateData: Partial<PartResponse> = {};
    
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
    
    const response = await apiPut<PartResponse>(`/parts/${partId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      name: response.name || '',
      partNumber: response.part_number || '',
      description: response.description || '',
      brand: response.brand || '',
      category: response.category || '',
      price: (response.price) || 0,
      cost: (response.cost) || 0,
      quantity: (response.quantity) || 0,
      minimumStock: response.minimum_stock || 0,
      location: response.location || '',
      isActive: response.is_active ?? true,
      shopId: response.shop_id?.toString() || '',
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString()
    };
  },

  // Delete part
  deletePart: async (partId: string): Promise<void> => {
    await apiDelete(`/parts/${partId}/`);
  },

  // Get low stock parts
  getLowStockParts: async (shopId?: string): Promise<Part[]> => {
    const endpoint = `/parts/low_stock/${shopId ? `?shop_id=${shopId}` : ''}`;
    const response = await apiGet<PartListResponse>(endpoint);
    
    const parts = response.results || response;
    
    return parts.map((part: PartResponse): Part => ({
      id: part.id?.toString() || '',
      name: part.name || '',
      partNumber: part.part_number || '',
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      price: (part.price) || 0,
      cost: (part.cost) || 0,
      quantity: (part.quantity) || 0,
      minimumStock: part.minimum_stock || 0,
      location: part.location || '',
      isActive: part.is_active ?? true,
      shopId: part.shop_id?.toString()|| '',
      createdAt: part.created_at || new Date().toISOString(),
      updatedAt: part.updated_at || new Date().toISOString()
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
