import type { 
  CreateRepairOrderData, 
  RepairOrder, 
  RepairOrderAPIResponse, 
  RepairOrderItem, 
  RepairOrderListAPIResponse, 
  RepairOrderQuery, 
  RepairOrderStatsAPIResponse, 
  UpdateRepairOrderData,
  CompleteWorkData,
  AddServiceData,
  RepairOrderCostBreakdown,
  RelatedAppointmentsResponse
} from '../types';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Transformation helper functions
const transformCustomerName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
};

const transformRepairOrderItems = (apiResponse: RepairOrderAPIResponse): RepairOrderItem[] => {
  const items: RepairOrderItem[] = [];

  // Add services
  if (apiResponse.repair_order_services && Array.isArray(apiResponse.repair_order_services)) {
    apiResponse.repair_order_services.forEach(serviceRel => {
      if (serviceRel.service) {
        items.push({
          id: typeof serviceRel.id === 'string' ? parseInt(serviceRel.id) : serviceRel.id,
          type: 'service',
          description: serviceRel.service.name || 'Unknown Service',
          quantity: 1,
          unitPrice: parseFloat(serviceRel.service.price || serviceRel.service.labor_cost || '0'),
          totalPrice: parseFloat(serviceRel.service.price || serviceRel.service.labor_cost || '0'),
          notes: serviceRel.service.description || ''
        });
      }
    });
  }

  // Add parts
  if (apiResponse.repair_order_parts && Array.isArray(apiResponse.repair_order_parts)) {
    apiResponse.repair_order_parts.forEach(partRel => {
      if (partRel.part) {
        items.push({
          id: typeof partRel.id === 'string' ? parseInt(partRel.id) : partRel.id,
          type: 'part',
          description: partRel.part.name || 'Unknown Part',
          quantity: partRel.quantity || 1,
          unitPrice: parseFloat(partRel.part.unit_price || '0'),
          totalPrice: parseFloat(partRel.total_price || '0'),
          partNumber: partRel.part.part_number,
          notes: partRel.part.description || ''
        });
      }
    });
  }

  return items;
};

const determineStatus = (): RepairOrder['status'] => {
  // Status logic based on appointment relationships would go here
  // For now, return 'pending' as default since status field doesn't exist in backend
  return 'pending';
};

const calculateSubtotal = (apiResponse: RepairOrderAPIResponse): number => {
  const partsTotal = (apiResponse.repair_order_parts && Array.isArray(apiResponse.repair_order_parts)) 
    ? apiResponse.repair_order_parts.reduce(
        (sum, partRel) => sum + parseFloat(partRel.total_price ?? '0'), 
        0
      )
    : 0;

  const servicesTotal = (apiResponse.repair_order_services && Array.isArray(apiResponse.repair_order_services)) 
    ? apiResponse.repair_order_services.reduce(
        (sum, serviceRel) => sum + parseFloat(serviceRel.service?.price || serviceRel.service?.labor_cost || '0'), 
        0
      )
    : 0;

  return partsTotal + servicesTotal;
};

const calculateTax = (apiResponse: RepairOrderAPIResponse): number => {
  const subtotal = calculateSubtotal(apiResponse);
  const taxRate = 0.0825; // Default 8.25% tax rate
  return subtotal * taxRate;
};

const transformRepairOrderData = (apiResponse: RepairOrderAPIResponse): RepairOrder => {
  try {
    console.log('🔀 Transforming repair order data:', apiResponse);
    
    // Add defensive checks for required data
    if (!apiResponse) {
      console.error('❌ API response is null or undefined');
      throw new Error('API response is null or undefined');
    }
    
    if (!apiResponse.id) {
      console.error('❌ API response missing required id field:', apiResponse);
      throw new Error(`API response missing required id field. Received: ${JSON.stringify(apiResponse)}`);
    }
    
    const customerNames = apiResponse.vehicle?.customer?.name
      ? transformCustomerName(apiResponse.vehicle.customer.name)
      : { firstName: '', lastName: '' };
    
    const transformedOrder: RepairOrder = {
      id: apiResponse.id,
      customerId: apiResponse.vehicle?.customer?.id ?? 0,
      vehicleId: apiResponse.vehicle?.id ?? 0,
      orderNumber: `RO-${apiResponse.id}`,
      status: determineStatus(),
      items: transformRepairOrderItems(apiResponse),
      subtotal: calculateSubtotal(apiResponse),
      tax: calculateTax(apiResponse),
      discount: parseFloat(apiResponse.discount_amount || '0'),
      total: parseFloat(apiResponse.total_cost || '0'),
      total_cost: apiResponse.total_cost || '0',
      priority: 'medium', // Default priority as backend does not provide this
      notes: apiResponse.notes || '',
      createdAt: apiResponse.date_created || new Date().toISOString(),
      customer: {
        id: apiResponse.vehicle?.customer?.id ?? 0,
        firstName: customerNames.firstName,
        lastName: customerNames.lastName,
        email: apiResponse.vehicle?.customer?.email ?? '',
        phone: apiResponse.vehicle?.customer?.phone_number ?? ''
      },
      vehicle: {
        id: apiResponse.vehicle?.id ?? 0,
        make: apiResponse.vehicle?.make ?? '',
        model: apiResponse.vehicle?.model ?? '',
        year: apiResponse.vehicle?.year ?? 0,
        license_plate: apiResponse.vehicle?.license_plate ?? '',
        vin: apiResponse.vehicle?.vin ?? '',
        customer: apiResponse.vehicle?.customer ? {
          id: apiResponse.vehicle.customer.id,
          name: apiResponse.vehicle.customer.name || '',
          phone_number: apiResponse.vehicle.customer.phone_number || '',
          email: apiResponse.vehicle.customer.email
        } : {
          id: 0,
          name: '',
          phone_number: '',
          email: ''
        }
      }
    };
    
    console.log('✅ Successfully transformed repair order:', transformedOrder);
    return transformedOrder;
    
  } catch (error) {
    console.error('❌ Error transforming repair order data:', error, 'Original data:', apiResponse);
    throw error;
  }
};

// Repair Order Management Service
export const repairOrderMngtService = {
  // Get all repair orders with optional filtering
  getRepairOrders: async (query: RepairOrderQuery = {}): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading repair orders from backend with query:', query);
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/', query);
      
      console.log('📥 Raw API response:', {
        response,
        type: typeof response,
        hasResults: !!response.results,
        hasRepairOrders: !!response.repairOrders,
        responseKeys: Object.keys(response || {}),
        resultsLength: response.results?.length,
        repairOrdersLength: response.repairOrders?.length
      });
      
      // Handle different response formats the backend might return
      let repairOrdersArray: RepairOrderAPIResponse[] = [];
      
      if (response.results && Array.isArray(response.results)) {
        repairOrdersArray = response.results;
      } else if (response.repairOrders && Array.isArray(response.repairOrders)) {
        repairOrdersArray = response.repairOrders;
      } else if (Array.isArray(response)) {
        // Sometimes the response might be directly an array
        repairOrdersArray = response as any;
      } else {
        console.warn('⚠️ Unexpected response format for repair orders:', response);
        repairOrdersArray = [];
      }
      
      if (repairOrdersArray.length === 0) {
        console.log('⚠️ No repair orders found in API response');
        return [];
      }
      
      console.log(`✅ Found ${repairOrdersArray.length} repair orders from backend`);
      
      const transformedOrders: RepairOrder[] = [];
      
      for (let i = 0; i < repairOrdersArray.length; i++) {
        try {
          const transformedOrder = transformRepairOrderData(repairOrdersArray[i]);
          transformedOrders.push(transformedOrder);
        } catch (transformError) {
          console.error(`❌ Failed to transform repair order ${i}:`, transformError, 'Raw data:', repairOrdersArray[i]);
          // Continue processing other orders instead of failing entirely
        }
      }
      
      console.log('🔀 Successfully transformed orders:', {
        total: transformedOrders.length,
        statuses: transformedOrders.map(o => ({ id: o.id, status: o.status }))
      });
      return transformedOrders;
      
    } catch (error: unknown) {
      console.error('❌ Error loading repair orders:', error);
      throw error;
    }
  },

  // Get single repair order by ID
  getRepairOrder: async (repairOrderId: number): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Loading repair order ${repairOrderId} from backend...`);
      
      const response = await apiGet<RepairOrderAPIResponse>(`/shop/repair-orders/${repairOrderId}/`);
      
      console.log(`✅ Loaded repair order ${repairOrderId} from backend`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading repair order ${repairOrderId}:`, error);
      throw error;
    }
  },

  // Create new repair order
  createRepairOrder: async (data: CreateRepairOrderData): Promise<RepairOrder> => {
    try {
      console.log('🔄 Creating repair order with data:', data);
      
      const response = await apiPost<RepairOrderAPIResponse>('/shop/repair-orders/', data);
      
      console.log('🔍 Raw API response:', {
        response,
        type: typeof response,
        hasId: response?.id,
        keys: response ? Object.keys(response) : 'none'
      });
      
      // If backend returns undefined/null but request succeeded
      if (!response) {
        console.warn('⚠️ Backend returned empty response. Attempting to fetch latest repair order...');
        
        try {
          // Fetch the most recent repair orders to get the one we just created
          const recentOrders = await repairOrderMngtService.getRepairOrders({ limit: 1, ordering: '-id' });
          if (recentOrders.length > 0) {
            console.log('✅ Found newly created repair order:', recentOrders[0]);
            return recentOrders[0];
          }
        } catch (fetchError) {
          console.error('❌ Failed to fetch newly created repair order:', fetchError);
        }
        
        throw new Error('Backend returned no data and unable to fetch newly created repair order. Please refresh the page to see your repair order.');
      }
      
      if (!response.id) {
        console.error('❌ Backend response missing ID field:', response);
        throw new Error(`Backend response missing required id field. Received: ${JSON.stringify(response)}`);
      }
      
      console.log(`✅ Created repair order ${response.id}`, response);
      
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error('❌ Error creating repair order:', error);
      
      // Provide user-friendly error message
      if (error instanceof Error && error.message.includes('missing required id field')) {
        throw new Error('Server error: Unable to create repair order. Please check server configuration.');
      }
      
      throw error;
    }
  },

  // Update existing repair order
  updateRepairOrder: async (repairOrderId: number, data: UpdateRepairOrderData): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Updating repair order ${repairOrderId}...`);
      
      const response = await apiPut<RepairOrderAPIResponse>(`/shop/repair-orders/${repairOrderId}/`, data);
      
      console.log(`✅ Updated repair order ${repairOrderId}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error updating repair order ${repairOrderId}:`, error);
      throw error;
    }
  },

  // Delete repair order
  deleteRepairOrder: async (repairOrderId: number): Promise<void> => {
    try {
      console.log(`🔄 Deleting repair order ${repairOrderId}...`);
      
      await apiDelete(`/shop/repair-orders/${repairOrderId}/`);
      
      console.log(`✅ Deleted repair order ${repairOrderId}`);
      
    } catch (error: unknown) {
      console.error(`❌ Error deleting repair order ${repairOrderId}:`, error);
      throw error;
    }
  },

  // Get repair order statistics
  getRepairOrderStats: async (): Promise<RepairOrderStatsAPIResponse> => {
    try {
      console.log('🔄 Loading repair order statistics...');
      
      const response = await apiGet<RepairOrderStatsAPIResponse>('/shop/repair-orders/stats/');
      
      console.log('✅ Loaded repair order statistics');
      return response;
      
    } catch (error: unknown) {
      console.error('❌ Error loading repair order statistics:', error);
      throw error;
    }
  },

  // Get active repair orders
  getActiveRepairOrders: async (): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading active repair orders from /shop/repair-orders/active/...');
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/active/');
      
      console.log('📥 Active repair orders API response:', {
        response,
        hasResults: !!response.results,
        resultsLength: response.results?.length,
        responseKeys: Object.keys(response || {}),
        sampleData: response.results?.[0]
      });
      
      // Handle different response formats the backend might return
      let repairOrdersArray: RepairOrderAPIResponse[] = [];
      
      if (response.results && Array.isArray(response.results)) {
        repairOrdersArray = response.results;
      } else if (response.repairOrders && Array.isArray(response.repairOrders)) {
        repairOrdersArray = response.repairOrders;
      } else if (Array.isArray(response)) {
        // Sometimes the response might be directly an array
        repairOrdersArray = response as any;
      } else {
        console.warn('⚠️ Unexpected response format for active repair orders:', response);
        repairOrdersArray = [];
      }
      
      if (repairOrdersArray.length === 0) {
        console.log('⚠️ No active repair orders found via dedicated endpoint, trying fallback...');
        
        // Fallback: try to get all repair orders and filter client-side
        try {
          const allOrders = await this.getRepairOrders();
          
          // Client-side filtering for active orders (status 'pending' or 'in_progress')
          const activeOrders = allOrders.filter(order => 
            order.status === 'pending' || order.status === 'in_progress'
          );
          
          console.log(`✅ Fallback found ${activeOrders.length} active orders from ${allOrders.length} total`);
          return activeOrders;
          
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          return [];
        }
      }
      
      const transformedOrders = repairOrdersArray.map(transformRepairOrderData);
      console.log(`✅ Loaded ${transformedOrders.length} active repair orders`);
      
      return transformedOrders;
      
    } catch (error: unknown) {
      console.error('❌ Error loading active repair orders:', error);
      
      // Fallback: try to get all repair orders and filter client-side
      try {
        console.log('🔄 Fallback: Trying to get all repair orders and filter for active ones...');
        const allOrders = await this.getRepairOrders();
        
        // Client-side filtering for active orders (status 'pending' or 'in_progress')
        const activeOrders = allOrders.filter(order => 
          order.status === 'pending' || order.status === 'in_progress'
        );
        
        console.log(`✅ Fallback successful: Found ${activeOrders.length} active orders from ${allOrders.length} total`);
        return activeOrders;
        
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  },

  // Get completed repair orders
  getCompletedRepairOrders: async (): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading completed repair orders...');
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/completed/');
      
      console.log(`✅ Loaded ${response.results?.length ?? 0} completed repair orders`);
      return (response.results ?? []).map(transformRepairOrderData);
      
    } catch (error: unknown) {
      console.error('❌ Error loading completed repair orders:', error);
      throw error;
    }
  },

  // Complete repair work
  completeRepairWork: async (id: string, data: CompleteWorkData): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Completing repair work for order ${id}...`);
      
      const response = await apiPost<RepairOrderAPIResponse>(`/shop/repair-orders/${id}/complete/`, data);
      
      console.log(`✅ Completed repair work for order ${id}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error completing repair work for order ${id}:`, error);
      throw error;
    }
  },

  // Add service to repair order
  addService: async (id: string, data: AddServiceData): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Adding service to repair order ${id}...`);
      
      const response = await apiPost<RepairOrderAPIResponse>(`/shop/repair-orders/${id}/add-service/`, data);
      
      console.log(`✅ Added service to repair order ${id}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error adding service to repair order ${id}:`, error);
      throw error;
    }
  },

  // Get cost breakdown for repair order
  getCostBreakdown: async (id: string): Promise<RepairOrderCostBreakdown> => {
    try {
      console.log(`🔄 Getting cost breakdown for repair order ${id}...`);
      
      const response = await apiGet<RepairOrderCostBreakdown>(`/shop/repair-orders/${id}/cost-breakdown/`);
      
      console.log(`✅ Got cost breakdown for repair order ${id}`);
      return response;
      
    } catch (error: unknown) {
      console.error(`❌ Error getting cost breakdown for repair order ${id}:`, error);
      throw error;
    }
  },

  // Get repair orders by customer ID
  getRepairOrdersByCustomer: async (customerId: number): Promise<RepairOrder[]> => {
    try {
      console.log(`🔄 Loading repair orders for customer ${customerId}...`);
      
      const response = await this.getRepairOrders({ customer_id: customerId });
      
      console.log(`✅ Loaded ${response.length} repair orders for customer ${customerId}`);
      return response;
      
    } catch (error: unknown) {
      console.error(`❌ Error loading repair orders for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Get related appointments
  getRelatedAppointments: async (id: string): Promise<RelatedAppointmentsResponse> => {
    try {
      console.log(`🔄 Getting related appointments for repair order ${id}...`);
      
      const response = await apiGet<RelatedAppointmentsResponse>(`/shop/repair-orders/${id}/appointments/`);
      
      console.log(`✅ Got related appointments for repair order ${id}`);
      return response;
      
    } catch (error: unknown) {
      console.error(`❌ Error getting related appointments for repair order ${id}:`, error);
      throw error;
    }
  }
};
