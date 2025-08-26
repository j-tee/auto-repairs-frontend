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

// Backend API response interfaces - exact match to backend structure

// export interface Customer {
//   id: number;
//   name: string;
//   phone_number: string;
//   email: string;
//   address: string;
// }

// export interface Vehicle {
//   id: number;
//   customer: Customer;
//   make: string;
//   model: string;
//   year: number;
//   vin: string;
//   license_plate: string;
//   color: string;
//   customer_name: string;
//   customer_email: string;
//   customer_phone: string;
// }


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
  
  // Add parts as items
  apiResponse.repair_order_parts.forEach(partRel => {
    items.push({
      id: Number(partRel.id),
      type: 'part',
      description: partRel.part.name,
      quantity: partRel.quantity,
      unitPrice: parseFloat(partRel.part.unit_price),
      totalPrice: parseFloat(partRel.total_price ?? '0'),
      partNumber: partRel.part.part_number,
      notes: partRel.part.description
    });
  });

  // Add services as items
  apiResponse.repair_order_services.forEach(serviceRel => {
    items.push({
      id: Number(serviceRel.id),
      type: 'service',
      description: serviceRel.service.name,
      quantity: 1,
      unitPrice: parseFloat(serviceRel.service.labor_cost),
      totalPrice: parseFloat(serviceRel.service.labor_cost),
      notes: serviceRel.service.description
    });
  });

  return items;
};

const determineStatus = (): RepairOrder['status'] => {
  // Status logic based on appointment relationships would go here
  // For now, return 'draft' as default since status field doesn't exist in backend
  return 'pending';
};

const calculateSubtotal = (apiResponse: RepairOrderAPIResponse): number => {
  const partsTotal = apiResponse.repair_order_parts.reduce(
    (sum, partRel) => sum + parseFloat(partRel.total_price ?? '0'), 
    0
  );
  const servicesTotal = apiResponse.repair_order_services.reduce(
    (sum, serviceRel) => sum + parseFloat(serviceRel.service.labor_cost), 
    0
  );
  return partsTotal + servicesTotal;
};

const calculateTax = (apiResponse: RepairOrderAPIResponse): number => {
  const subtotal = calculateSubtotal(apiResponse);
  const taxRate = parseFloat(apiResponse.tax_percent) / 100;
  return subtotal * taxRate;
};

const transformRepairOrderData = (apiResponse: RepairOrderAPIResponse): RepairOrder => {
  const customerNames = apiResponse.vehicle?.customer?.name
    ? transformCustomerName(apiResponse.vehicle.customer.name)
    : { firstName: '', lastName: '' };
  
  return {
    id: apiResponse.id,
    customerId: apiResponse.vehicle?.customer?.id ?? 0,
    vehicleId: apiResponse.vehicle?.id ?? 0,
    orderNumber: `RO-${apiResponse.id}`,
    status: determineStatus(),
    items: transformRepairOrderItems(apiResponse),
    subtotal: calculateSubtotal(apiResponse),
    tax: calculateTax(apiResponse),
    discount: parseFloat(apiResponse.discount_amount),
    total: parseFloat(apiResponse.total_cost),
    total_cost: apiResponse.total_cost,
    priority: 'medium', // Default priority as backend does not provide this
    notes: apiResponse.notes || '',
    createdAt: apiResponse.date_created,
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
      customer: {
        id: apiResponse.vehicle?.customer?.id ?? 0,
        name: apiResponse.vehicle?.customer?.name ?? '',
        email: apiResponse.vehicle?.customer?.email ?? '',
        phone_number: apiResponse.vehicle?.customer?.phone_number ?? ''
      }
    }
  };
};

// Repair Order Management Service
export const repairOrderMngtService = {
  // Get all repair orders with optional filtering
  getRepairOrders: async (query: RepairOrderQuery = {}): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading repair orders from backend...');
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/', query);
      
      console.log(`✅ Loaded ${response.results?.length ?? 0} repair orders from backend`);
      return (response.results ?? []).map(transformRepairOrderData);
      
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
      console.log('🔄 Creating repair order...');
      
      const response = await apiPost<RepairOrderAPIResponse>('/shop/repair-orders/', data);
      
      console.log(`✅ Created repair order ${response.id}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error('❌ Error creating repair order:', error);
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

  // Get repair orders by customer
  getRepairOrdersByCustomer: async (customerId: number): Promise<RepairOrder[]> => {
    try {
      console.log(`🔄 Loading repair orders for customer ${customerId}...`);
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/by_customer/', { customer_id: customerId });
      
      console.log(`✅ Loaded ${(response.results?.length ?? 0)} repair orders for customer ${customerId}`);
      return (response.results ?? []).map(transformRepairOrderData);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading repair orders for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Get repair orders by vehicle
  getRepairOrdersByVehicle: async (vehicleId: number): Promise<RepairOrder[]> => {
    try {
      console.log(`🔄 Loading repair orders for vehicle ${vehicleId}...`);
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/by_vehicle/', { vehicle_id: vehicleId });
      
      console.log(`✅ Loaded ${(response.results?.length ?? 0)} repair orders for vehicle ${vehicleId}`);
      return (response.results ?? []).map(transformRepairOrderData);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading repair orders for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  // Get active repair orders
  getActiveRepairOrders: async (): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading active repair orders from backend...');
      
      const response = await apiGet<RepairOrderListAPIResponse>('/shop/repair-orders/active/');
      
      console.log(`✅ Loaded ${(response.results?.length ?? 0)} active repair orders from backend`);
      return (response.results ?? []).map(transformRepairOrderData);
      
    } catch (error: unknown) {
      console.error('❌ Error loading active repair orders:', error);
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

  // Start work on repair order
  startWork: async (id: string): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Starting work on repair order ${id}...`);
      
      const response = await apiPost<RepairOrderAPIResponse>(`/shop/repair-orders/${id}/start-work/`, {});
      
      console.log(`✅ Started work on repair order ${id}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error starting work on repair order ${id}:`, error);
      throw error;
    }
  },

  // Complete work on repair order
  completeWork: async (id: string, data: CompleteWorkData): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Completing work on repair order ${id}...`);
      
      const response = await apiPost<RepairOrderAPIResponse>(`/shop/repair-orders/${id}/complete-work/`, data);
      
      console.log(`✅ Completed work on repair order ${id}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error completing work on repair order ${id}:`, error);
      throw error;
    }
  },

  // Add service to repair order
  addService: async (repairOrderId: string, serviceData: AddServiceData): Promise<RepairOrder> => {
    try {
      console.log(`🔄 Adding service to repair order ${repairOrderId}...`);
      
      const response = await apiPost<RepairOrderAPIResponse>(`/shop/repair-orders/${repairOrderId}/add-service/`, serviceData);
      
      console.log(`✅ Added service to repair order ${repairOrderId}`);
      return transformRepairOrderData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error adding service to repair order ${repairOrderId}:`, error);
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
