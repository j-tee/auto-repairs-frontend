import type { Service } from '../types/repairOrders';
import type { CreateServiceData, ServiceListResponse, ServiceQuery, ServiceResponse, UpdateServiceData } from '../types/services';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';


// Service Management Service
export const serviceMngtService = {
  // Get all services
  getServices: async (query: ServiceQuery = {}): Promise<Service[]> => {
    const params = new URLSearchParams();
    
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.shop) params.append('shop', query.shop.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    
    const endpoint = `/services/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiGet<ServiceListResponse>(endpoint);
    
    // Handle both paginated and non-paginated responses
    const services = response.results || response;
    
    return services.map((service: ServiceResponse): Service => ({
      id: service.id ?? '',
      shop: service.shop,
      name: service.name || '',
      description: service.description,
      category: service.category,
      labor_cost: service.labor_cost || service.price || '0',
      price: service.price || service.labor_cost,
      taxable: service.taxable ?? false,
      warranty_months: service.warranty_months || 0
    }));
  },

  // Get service by ID
  getServiceById: async (serviceId: string): Promise<Service> => {
    const response = await apiGet<ServiceResponse>(`/services/${serviceId}/`);
    
    return {
      id: response.id ?? '',
      shop: response.shop,
      name: response.name || '',
      description: response.description,
      category: response.category,
      labor_cost: response.labor_cost || response.price || '0',
      price: response.price || response.labor_cost,
      taxable: response.taxable ?? false,
      warranty_months: response.warranty_months || 0
    };
  },

  // Create new service
  createService: async (serviceData: CreateServiceData): Promise<Service> => {
    const createData = {
      shop: serviceData.shop,
      name: serviceData.name,
      description: serviceData.description,
      category: serviceData.category,
      labor_cost: serviceData.labor_cost,
      price: serviceData.price,
      taxable: serviceData.taxable ?? false,
      warranty_months: serviceData.warranty_months ?? 0
    };
    
    const response = await apiPost<ServiceResponse>('/services/', createData);
    
    return {
      id: response.id ?? '',
      shop: response.shop,
      name: response.name || '',
      description: response.description,
      category: response.category,
      labor_cost: response.labor_cost || response.price || '0',
      price: response.price || response.labor_cost,
      taxable: response.taxable ?? false,
      warranty_months: response.warranty_months || 0
    };
  },

  // Update service
  updateService: async (serviceId: string, serviceData: UpdateServiceData): Promise<Service> => {
    const updateData: Partial<ServiceResponse> = {};
    
    if (serviceData.shop !== undefined) updateData.shop = serviceData.shop;
    if (serviceData.name !== undefined) updateData.name = serviceData.name;
    if (serviceData.description !== undefined) updateData.description = serviceData.description;
    if (serviceData.category !== undefined) updateData.category = serviceData.category;
    if (serviceData.labor_cost !== undefined) updateData.labor_cost = serviceData.labor_cost;
    if (serviceData.price !== undefined) updateData.price = serviceData.price;
    if (serviceData.taxable !== undefined) updateData.taxable = serviceData.taxable;
    if (serviceData.warranty_months !== undefined) updateData.warranty_months = serviceData.warranty_months;
    
    const response = await apiPut<ServiceResponse>(`/services/${serviceId}/`, updateData);
    
    return {
      id: response.id ?? '',
      shop: response.shop,
      name: response.name || '',
      description: response.description,
      category: response.category,
      labor_cost: response.labor_cost || response.price || '0',
      price: response.price || response.labor_cost,
      taxable: response.taxable ?? false,
      warranty_months: response.warranty_months || 0
    };
  },

  // Delete service
  deleteService: async (serviceId: string): Promise<void> => {
    await apiDelete(`/services/${serviceId}/`);
  },

  // Get services by shop
  getServicesByShop: async (shopId: number): Promise<Service[]> => {
    return serviceMngtService.getServices({ shop: shopId });
  },

  // Get services by category
  getServicesByCategory: async (category: string): Promise<Service[]> => {
    return serviceMngtService.getServices({ category });
  }
};
