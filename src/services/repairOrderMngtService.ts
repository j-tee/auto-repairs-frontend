import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Repair Order types
export interface RepairOrderItem {
  id: string;
  type: 'labor' | 'part' | 'service';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  partNumber?: string;
  laborHours?: number;
  discount?: number;
  taxRate?: number;
  notes?: string;
}

export interface RepairOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  orderNumber: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  diagnosis?: string;
  recommendations?: string;
  items: RepairOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedTechnician?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;
  };
  technician?: {
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  notes?: string;
  images?: string[];
  warranty?: {
    type: string;
    duration: number;
    description: string;
  };
}

export interface CreateRepairOrderData {
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  priority?: RepairOrder['priority'];
  description: string;
  diagnosis?: string;
  recommendations?: string;
  items?: Omit<RepairOrderItem, 'id'>[];
  estimatedCompletionDate?: string;
  assignedTechnician?: string;
  notes?: string;
  warranty?: RepairOrder['warranty'];
}

export interface UpdateRepairOrderData {
  customerId?: string;
  vehicleId?: string;
  status?: RepairOrder['status'];
  priority?: RepairOrder['priority'];
  description?: string;
  diagnosis?: string;
  recommendations?: string;
  items?: RepairOrderItem[];
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedTechnician?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  notes?: string;
  images?: string[];
  warranty?: RepairOrder['warranty'];
}

export interface RepairOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  // Filters repair orders by their own status (e.g., 'draft', 'approved', etc.)
  status?: string; 
  priority?: RepairOrder['priority'];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
}

export interface RepairOrderListResponse {
  repairOrders: RepairOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RepairOrderStats {
  totalOrders: number;
  activeOrders: number;
  completedThisMonth: number;
  totalRevenueThisMonth: number;
  averageOrderValue: number;
  ordersByStatus: {
    draft: number;
    approved: number;
    in_progress: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
  topServices: { service: string; count: number; revenue: number }[];
}

// Repair Order Management Service
export const repairOrderMngtService = {
  // Get all repair orders with filtering and pagination
  getRepairOrders: async (query: RepairOrderQuery = {}): Promise<RepairOrderListResponse> => {
    try {
      console.log('🔧 Loading repair orders with query:', query);
      
      const params = new URLSearchParams();
      
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.customerId) params.append('customer_id', query.customerId);
      if (query.vehicleId) params.append('vehicle_id', query.vehicleId);
      if (query.technicianId) params.append('technician_id', query.technicianId);
      if (query.status) params.append('status', query.status);
      if (query.priority) params.append('priority', query.priority);
      if (query.dateFrom) params.append('date_from', query.dateFrom);
      if (query.dateTo) params.append('date_to', query.dateTo);
      if (query.sortBy) params.append('sort_by', query.sortBy);
      if (query.sortOrder) params.append('sort_order', query.sortOrder);
      if (query.minAmount) params.append('min_amount', query.minAmount.toString());
      if (query.maxAmount) params.append('max_amount', query.maxAmount.toString());
      
      const queryString = params.toString();
      const endpoint = `/shop/repair-orders/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiGet<any>(endpoint);
      
      console.log('✅ Repair orders loaded successfully:', response);
      
      // Handle different response structures
      const ordersArray = response.results || response.repair_orders || response || [];
      
      return {
        repairOrders: ordersArray.map((order: any) => ({
          id: order.id?.toString() || '',
          customerId: order.customer_id?.toString() || '',
          vehicleId: order.vehicle_id?.toString() || '',
          appointmentId: order.appointment_id?.toString(),
          orderNumber: order.order_number || `RO-${order.id}`,
          status: order.status || 'draft',
          priority: order.priority || 'medium',
          description: order.description || '',
          diagnosis: order.diagnosis,
          recommendations: order.recommendations,
          items: order.items?.map((item: any) => ({
            id: item.id?.toString() || '',
            type: item.type || 'service',
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            totalPrice: item.total_price || 0,
            partNumber: item.part_number,
            laborHours: item.labor_hours,
            discount: item.discount || 0,
            taxRate: item.tax_rate || 0,
            notes: item.notes
          })) || [],
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          estimatedCompletionDate: order.estimated_completion_date,
          actualCompletionDate: order.actual_completion_date,
          assignedTechnician: order.assigned_technician?.toString(),
          authorizedBy: order.authorized_by?.toString(),
          authorizedAt: order.authorized_at,
          createdAt: order.created_at || new Date().toISOString(),
          updatedAt: order.updated_at || new Date().toISOString(),
          customer: order.customer ? {
            id: order.customer.id?.toString() || '',
            firstName: order.customer.first_name || '',
            lastName: order.customer.last_name || '',
            email: order.customer.email || '',
            phone: order.customer.phone || ''
          } : undefined,
          vehicle: order.vehicle ? {
            id: order.vehicle.id?.toString() || '',
            make: order.vehicle.make || '',
            model: order.vehicle.model || '',
            year: order.vehicle.year || new Date().getFullYear(),
            licensePlate: order.vehicle.license_plate || '',
            vin: order.vehicle.vin || ''
          } : undefined,
          technician: order.technician ? {
            id: order.technician.id?.toString() || '',
            firstName: order.technician.first_name || '',
            lastName: order.technician.last_name || '',
            specialties: order.technician.specialties || []
          } : undefined,
          notes: order.notes,
          images: order.images || [],
          warranty: order.warranty ? {
            type: order.warranty.type || '',
            duration: order.warranty.duration || 0,
            description: order.warranty.description || ''
          } : undefined
        })),
        total: response.count || ordersArray.length,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil((response.count || ordersArray.length) / (query.limit || 10))
      };
    } catch (error: any) {
      console.error('❌ Error loading repair orders:', error);
      
      // Check if it's a server error (500) and try alternative endpoints
      if (error.status === 500) {
        console.warn('🚧 Main repair orders endpoint returned 500 error - trying fallback approaches...');
        
        try {
          // Try the active orders endpoint as fallback
          console.log('🔄 Trying active repair orders endpoint as fallback...');
          const activeResponse = await apiGet<any>('/shop/repair-orders/active/');
          const activeOrders = Array.isArray(activeResponse) ? activeResponse : (activeResponse.results || []);
          
          console.log(`✅ Active orders fallback successful - found ${activeOrders.length} active orders`);
          
          return {
            repairOrders: activeOrders.map((order: any) => ({
              id: order.id?.toString() || '',
              customerId: order.customer_id?.toString() || '',
              vehicleId: order.vehicle_id?.toString() || '',
              appointmentId: order.appointment_id?.toString(),
              orderNumber: order.order_number || `RO-${order.id}`,
              status: order.status || 'in_progress',
              priority: order.priority || 'medium',
              description: order.description || '',
              diagnosis: order.diagnosis,
              recommendations: order.recommendations,
              items: [],
              subtotal: order.subtotal || 0,
              tax: order.tax || 0,
              discount: order.discount || 0,
              total: order.total || 0,
              estimatedCompletionDate: order.estimated_completion_date,
              actualCompletionDate: order.actual_completion_date,
              assignedTechnician: order.assigned_technician?.toString(),
              authorizedBy: order.authorized_by?.toString(),
              authorizedAt: order.authorized_at,
              createdAt: order.created_at || new Date().toISOString(),
              updatedAt: order.updated_at || new Date().toISOString(),
              notes: order.notes,
              images: [],
              warranty: undefined
            })),
            total: activeOrders.length,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: Math.ceil(activeOrders.length / (query.limit || 10))
          };
        } catch (fallbackError) {
          console.warn('❌ Active orders fallback also failed:', fallbackError);
          
          // Try one more alternative approach - use a different endpoint pattern
          try {
            console.log('🔄 Trying alternative repair orders endpoint pattern...');
            const altResponse = await apiGet<any>('/shop/repair-orders/', { 
              status: 'in_progress',
              limit: query.limit || 10 
            });
            const altOrders = Array.isArray(altResponse) ? altResponse : 
                            (altResponse.results || altResponse.repairOrders || []);
            
            console.log(`✅ Alternative endpoint successful - found ${altOrders.length} orders`);
            
            return {
              repairOrders: altOrders.map((order: any) => ({
                id: order.id?.toString() || '',
                customerId: order.customer_id?.toString() || '',
                vehicleId: order.vehicle_id?.toString() || '',
                appointmentId: order.appointment_id?.toString(),
                orderNumber: order.order_number || `RO-${order.id}`,
                status: order.status || 'in_progress',
                priority: order.priority || 'medium',
                description: order.description || 'Repair Service',
                diagnosis: order.diagnosis,
                recommendations: order.recommendations,
                items: [],
                subtotal: order.subtotal || 0,
                tax: order.tax || 0,
                discount: order.discount || 0,
                total: order.total || 0,
                estimatedCompletionDate: order.estimated_completion_date,
                actualCompletionDate: order.actual_completion_date,
                assignedTechnician: order.assigned_technician?.toString(),
                authorizedBy: order.authorized_by?.toString(),
                authorizedAt: order.authorized_at,
                createdAt: order.created_at || new Date().toISOString(),
                updatedAt: order.updated_at || new Date().toISOString(),
                notes: order.notes,
                images: [],
                warranty: undefined
              })),
              total: altOrders.length,
              page: query.page || 1,
              limit: query.limit || 10,
              totalPages: Math.ceil(altOrders.length / (query.limit || 10))
            };
          } catch (altError) {
            console.warn('❌ Alternative endpoint also failed:', altError);
            
            // Final fallback - return empty result
            console.warn('🚧 All repair order endpoints failed - returning empty result');
            return {
              repairOrders: [],
              total: 0,
              page: query.page || 1,
              limit: query.limit || 10,
              totalPages: 0
            };
          }
        }
      }
      
      // For other errors, still throw to let caller handle
      throw error;
    }
  },

  // Get repair order by ID
  getRepairOrderById: async (repairOrderId: string): Promise<RepairOrder> => {
    const response = await apiGet<any>(`/shop/repair-orders/${repairOrderId}/`);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || '',
      status: response.status || 'draft',
      priority: response.priority || 'medium',
      description: response.description || '',
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items: response.items?.map((item: any) => ({
        id: item.id?.toString() || '',
        type: item.type || 'service',
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        totalPrice: item.total_price || 0,
        partNumber: item.part_number,
        laborHours: item.labor_hours,
        discount: item.discount || 0,
        taxRate: item.tax_rate || 0,
        notes: item.notes
      })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      vehicle: response.vehicle ? {
        id: response.vehicle.id?.toString() || '',
        make: response.vehicle.make || '',
        model: response.vehicle.model || '',
        year: response.vehicle.year || new Date().getFullYear(),
        licensePlate: response.vehicle.license_plate || '',
        vin: response.vehicle.vin || ''
      } : undefined,
      technician: response.technician ? {
        id: response.technician.id?.toString() || '',
        firstName: response.technician.first_name || '',
        lastName: response.technician.last_name || '',
        specialties: response.technician.specialties || []
      } : undefined,
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty ? {
        type: response.warranty.type || '',
        duration: response.warranty.duration || 0,
        description: response.warranty.description || ''
      } : undefined
    };
  },

  // Create new repair order
  createRepairOrder: async (repairOrderData: CreateRepairOrderData): Promise<RepairOrder> => {
    const createData = {
      customer_id: repairOrderData.customerId,
      vehicle_id: repairOrderData.vehicleId,
      appointment_id: repairOrderData.appointmentId,
      priority: repairOrderData.priority || 'medium',
      description: repairOrderData.description,
      diagnosis: repairOrderData.diagnosis,
      recommendations: repairOrderData.recommendations,
      items: repairOrderData.items?.map(item => ({
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        part_number: item.partNumber,
        labor_hours: item.laborHours,
        discount: item.discount || 0,
        tax_rate: item.taxRate || 0,
        notes: item.notes
      })) || [],
      estimated_completion_date: repairOrderData.estimatedCompletionDate,
      assigned_technician: repairOrderData.assignedTechnician,
      notes: repairOrderData.notes,
      warranty: repairOrderData.warranty
    };
    
    const response = await apiPost<any>('/shop/repair-orders/', createData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || '',
      status: response.status || 'draft',
      priority: response.priority || 'medium',
      description: response.description || '',
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items: response.items?.map((item: any) => ({
        id: item.id?.toString() || '',
        type: item.type || 'service',
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        totalPrice: item.total_price || 0,
        partNumber: item.part_number,
        laborHours: item.labor_hours,
        discount: item.discount || 0,
        taxRate: item.tax_rate || 0,
        notes: item.notes
      })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty ? {
        type: response.warranty.type || '',
        duration: response.warranty.duration || 0,
        description: response.warranty.description || ''
      } : undefined
    };
  },

  // Update repair order
  updateRepairOrder: async (repairOrderId: string, repairOrderData: UpdateRepairOrderData): Promise<RepairOrder> => {
    const updateData = {
      customer_id: repairOrderData.customerId,
      vehicle_id: repairOrderData.vehicleId,
      status: repairOrderData.status,
      priority: repairOrderData.priority,
      description: repairOrderData.description,
      diagnosis: repairOrderData.diagnosis,
      recommendations: repairOrderData.recommendations,
      items: repairOrderData.items?.map(item => ({
        id: item.id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        part_number: item.partNumber,
        labor_hours: item.laborHours,
        discount: item.discount || 0,
        tax_rate: item.taxRate || 0,
        notes: item.notes
      })),
      estimated_completion_date: repairOrderData.estimatedCompletionDate,
      actual_completion_date: repairOrderData.actualCompletionDate,
      assigned_technician: repairOrderData.assignedTechnician,
      authorized_by: repairOrderData.authorizedBy,
      notes: repairOrderData.notes,
      images: repairOrderData.images,
      warranty: repairOrderData.warranty
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/shop/repair-orders/${repairOrderId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || '',
      status: response.status || 'draft',
      priority: response.priority || 'medium',
      description: response.description || '',
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items: response.items?.map((item: any) => ({
        id: item.id?.toString() || '',
        type: item.type || 'service',
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        totalPrice: item.total_price || 0,
        partNumber: item.part_number,
        laborHours: item.labor_hours,
        discount: item.discount || 0,
        taxRate: item.tax_rate || 0,
        notes: item.notes
      })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      vehicle: response.vehicle ? {
        id: response.vehicle.id?.toString() || '',
        make: response.vehicle.make || '',
        model: response.vehicle.model || '',
        year: response.vehicle.year || new Date().getFullYear(),
        licensePlate: response.vehicle.license_plate || '',
        vin: response.vehicle.vin || ''
      } : undefined,
      technician: response.technician ? {
        id: response.technician.id?.toString() || '',
        firstName: response.technician.first_name || '',
        lastName: response.technician.last_name || '',
        specialties: response.technician.specialties || []
      } : undefined,
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty ? {
        type: response.warranty.type || '',
        duration: response.warranty.duration || 0,
        description: response.warranty.description || ''
      } : undefined
    };
  },

  // Delete repair order
  deleteRepairOrder: async (repairOrderId: string): Promise<void> => {
    await apiDelete(`/shop/repair-orders/${repairOrderId}/`);
  },

  // Approve repair order
  approveRepairOrder: async (repairOrderId: string, authorizedBy: string): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: 'approved',
      authorizedBy,
      authorizedAt: new Date().toISOString()
    });
  },

  // Start repair order work
  startRepairOrder: async (repairOrderId: string): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: 'in_progress'
    });
  },

  // Complete repair order
  completeRepairOrder: async (repairOrderId: string): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: 'completed',
      actualCompletionDate: new Date().toISOString()
    });
  },

  // Put repair order on hold
  holdRepairOrder: async (repairOrderId: string, reason?: string): Promise<RepairOrder> => {
    const updateData: UpdateRepairOrderData = { status: 'on_hold' };
    if (reason) {
      updateData.notes = reason;
    }
    
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, updateData);
  },

  // Cancel repair order
  cancelRepairOrder: async (repairOrderId: string, reason?: string): Promise<RepairOrder> => {
    const updateData: UpdateRepairOrderData = { status: 'cancelled' };
    if (reason) {
      updateData.notes = reason;
    }
    
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, updateData);
  },

  // Get active repair orders
  getActiveRepairOrders: async (): Promise<RepairOrder[]> => {
    try {
      console.log('🔄 Loading active repair orders from backend...');
      
      // Use the new backend endpoint that handles filtering efficiently
      const response = await apiGet<RepairOrder[]>('/shop/repair-orders/active/');
      
      console.log(`✅ Loaded ${response.length} active repair orders from backend`);
      return response;
      
    } catch (error: any) {
      console.error('❌ Error loading active repair orders:', error);
      
      // Fallback: get recent repair orders if active endpoint fails
      console.log('🔄 Falling back to recent repair orders...');
      try {
        const query: RepairOrderQuery = {
          sortBy: 'date_created',
          sortOrder: 'desc',
          limit: 10
        };
        const fallbackResponse = await repairOrderMngtService.getRepairOrders(query);
        console.log(`✅ Fallback: Loaded ${fallbackResponse.repairOrders.length} recent repair orders`);
        return fallbackResponse.repairOrders;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  // Get repair order statistics
  getRepairOrderStats: async (): Promise<RepairOrderStats> => {
    try {
      console.log('📊 Loading repair order statistics...');
      const response = await apiGet<any>('/shop/repair-orders/stats/');
      
      console.log('✅ Repair order stats loaded:', response);
      
      return {
        totalOrders: response.total_orders || 0,
        activeOrders: response.active_orders || 0,
        completedThisMonth: response.completed_this_month || 0,
        totalRevenueThisMonth: response.total_revenue_this_month || 0,
        averageOrderValue: response.average_order_value || 0,
        ordersByStatus: {
          draft: response.orders_by_status?.draft || 0,
          approved: response.orders_by_status?.approved || 0,
          in_progress: response.orders_by_status?.in_progress || 0,
          completed: response.orders_by_status?.completed || 0,
          on_hold: response.orders_by_status?.on_hold || 0,
          cancelled: response.orders_by_status?.cancelled || 0
        },
        topServices: response.top_services?.map((service: any) => ({
          service: service.service || '',
          count: service.count || 0,
          revenue: service.revenue || 0
        })) || []
      };
    } catch (error: any) {
      console.error('❌ Error loading repair order stats:', error);
      
      // If stats endpoint fails, return default values instead of throwing
      if (error.status === 500 || error.status === 404) {
        console.warn('🚧 Repair order stats endpoint failed - returning default values as fallback');
        return {
          totalOrders: 0,
          activeOrders: 0,
          completedThisMonth: 0,
          totalRevenueThisMonth: 0,
          averageOrderValue: 0,
          ordersByStatus: {
            draft: 0,
            approved: 0,
            in_progress: 0,
            completed: 0,
            on_hold: 0,
            cancelled: 0
          },
          topServices: []
        };
      }
      
      // For other errors, still throw to let caller handle
      throw error;
    }
  },

  // Add item to repair order
  addRepairOrderItem: async (repairOrderId: string, item: Omit<RepairOrderItem, 'id'>): Promise<RepairOrder> => {
    const currentOrder = await repairOrderMngtService.getRepairOrderById(repairOrderId);
    const newItems = [...currentOrder.items, { ...item, id: Date.now().toString() }];
    
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, { items: newItems });
  },

  // Remove item from repair order
  removeRepairOrderItem: async (repairOrderId: string, itemId: string): Promise<RepairOrder> => {
    const currentOrder = await repairOrderMngtService.getRepairOrderById(repairOrderId);
    const newItems = currentOrder.items.filter(item => item.id !== itemId);
    
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, { items: newItems });
  },

  // Generate repair order PDF
  generateRepairOrderPDF: async (repairOrderId: string): Promise<Blob> => {
    const response = await fetch(`/shop/repair-orders/${repairOrderId}/pdf/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('PDF generation failed');
    }
    
    return await response.blob();
  },

  // Search repair orders
  searchRepairOrders: async (searchTerm: string, options: { limit?: number; status?: RepairOrder['status'] } = {}): Promise<RepairOrder[]> => {
    const query: RepairOrderQuery = {
      search: searchTerm,
      limit: options.limit || 10
    };
    
    if (options.status) {
      query.status = options.status;
    }
    
    const response = await repairOrderMngtService.getRepairOrders(query);
    return response.repairOrders;
  }
};
