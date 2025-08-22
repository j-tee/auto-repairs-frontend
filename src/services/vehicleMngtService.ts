import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Vehicle types
export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color?: string;
  engine?: string;
  transmission?: string;
  mileage?: number;
  fuelType?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  lastServiceDate?: string;
  nextServiceDue?: string;
  repairHistory?: any[];
}

export interface CreateVehicleData {
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color?: string;
  engine?: string;
  transmission?: string;
  mileage?: number;
  fuelType?: string;
  notes?: string;
}

export interface UpdateVehicleData {
  customerId?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  engine?: string;
  transmission?: string;
  mileage?: number;
  fuelType?: string;
  notes?: string;
  isActive?: boolean;
}

export interface VehicleQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  make?: string;
  model?: string;
  year?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  serviceDue?: boolean;
  lastServiceBefore?: string;
  lastServiceAfter?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  servicesDue: number;
  averageMileage: number;
  topMakes: { make: string; count: number }[];
  recentlyAdded: Vehicle[];
}

export interface VehicleServiceHistory {
  vehicleId: string;
  services: any[];
  totalCost: number;
  lastService?: string;
  nextServiceDue?: string;
  maintenanceReminders: any[];
}

// Vehicle Management Service
export const vehicleMngtService = {
  // Get all vehicles with filtering and pagination
  getVehicles: async (query: VehicleQuery = {}): Promise<VehicleListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.customerId) params.append('customer_id', query.customerId);
    if (query.make) params.append('make', query.make);
    if (query.model) params.append('model', query.model);
    if (query.year) params.append('year', query.year.toString());
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);
    if (query.serviceDue !== undefined) params.append('service_due', query.serviceDue.toString());
    if (query.lastServiceBefore) params.append('last_service_before', query.lastServiceBefore);
    if (query.lastServiceAfter) params.append('last_service_after', query.lastServiceAfter);
    
    const queryString = params.toString();
    const endpoint = `/shop/vehicles/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    
    // Handle different response structures - API might return array directly or wrapped
    const vehicleArray = Array.isArray(response) ? response : (response.results || response.vehicles || response || []);
    
    return {
      vehicles: vehicleArray.map((vehicle: any) => ({
        id: vehicle.id?.toString() || '',
        customerId: vehicle.customer_id?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        licensePlate: vehicle.license_plate || '',
        color: vehicle.color,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuel_type,
        notes: vehicle.notes,
        isActive: vehicle.is_active ?? true,
        createdAt: vehicle.created_at || new Date().toISOString(),
        updatedAt: vehicle.updated_at || new Date().toISOString(),
        customer: vehicle.customer ? {
          id: vehicle.customer.id?.toString() || '',
          firstName: vehicle.customer.first_name || '',
          lastName: vehicle.customer.last_name || '',
          email: vehicle.customer.email || '',
          phone: vehicle.customer.phone || ''
        } : undefined,
        lastServiceDate: vehicle.last_service_date,
        nextServiceDue: vehicle.next_service_due,
        repairHistory: vehicle.repair_history || []
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get vehicles for a specific customer (with client-side filtering if backend doesn't support it)
  getCustomerVehicles: async (customerId: string): Promise<Vehicle[]> => {
    try {
      // First try with customer_id parameter (in case backend supports it)
      const response = await vehicleMngtService.getVehicles({
        customerId,
        limit: 1000
      });
      
      const allVehicles = response.vehicles || [];
      
      // Check if backend filtering worked by verifying all returned vehicles belong to the customer
      const belongsToCustomer = allVehicles.every(vehicle => 
        vehicle.customerId === customerId
      );
      
      if (belongsToCustomer && allVehicles.length > 0) {
        // Backend filtering worked
        return allVehicles;
      } else if (allVehicles.length === 0) {
        // No vehicles found (either no vehicles exist or customer has no vehicles)
        return [];
      } else {
        // Backend didn't filter, apply client-side filtering
        console.log(`Backend returned ${allVehicles.length} vehicles, filtering for customer ${customerId}`);
        const filteredVehicles = allVehicles.filter(vehicle => 
          vehicle.customerId === customerId
        );
        console.log(`Found ${filteredVehicles.length} vehicles for customer ${customerId}`);
        return filteredVehicles;
      }
    } catch (error: any) {
      console.error('Error loading customer vehicles:', error);
      throw error;
    }
  },
  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const response = await apiGet<any>(`/shop/vehicles/${vehicleId}/`);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      make: response.make || '',
      model: response.model || '',
      year: response.year || new Date().getFullYear(),
      vin: response.vin || '',
      licensePlate: response.license_plate || '',
      color: response.color,
      engine: response.engine,
      transmission: response.transmission,
      mileage: response.mileage,
      fuelType: response.fuel_type,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      lastServiceDate: response.last_service_date,
      nextServiceDue: response.next_service_due,
      repairHistory: response.repair_history || []
    };
  },

  // Create new vehicle
  createVehicle: async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
    const createData = {
      customer_id: vehicleData.customerId,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vin: vehicleData.vin,
      license_plate: vehicleData.licensePlate,
      color: vehicleData.color,
      engine: vehicleData.engine,
      transmission: vehicleData.transmission,
      mileage: vehicleData.mileage,
      fuel_type: vehicleData.fuelType,
      notes: vehicleData.notes
    };
    
    const response = await apiPost<any>('/shop/vehicles/', createData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      make: response.make || '',
      model: response.model || '',
      year: response.year || new Date().getFullYear(),
      vin: response.vin || '',
      licensePlate: response.license_plate || '',
      color: response.color,
      engine: response.engine,
      transmission: response.transmission,
      mileage: response.mileage,
      fuelType: response.fuel_type,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      lastServiceDate: response.last_service_date,
      nextServiceDue: response.next_service_due,
      repairHistory: response.repair_history || []
    };
  },

  // Update vehicle
  updateVehicle: async (vehicleId: string, vehicleData: UpdateVehicleData): Promise<Vehicle> => {
    const updateData = {
      customer_id: vehicleData.customerId,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vin: vehicleData.vin,
      license_plate: vehicleData.licensePlate,
      color: vehicleData.color,
      engine: vehicleData.engine,
      transmission: vehicleData.transmission,
      mileage: vehicleData.mileage,
      fuel_type: vehicleData.fuelType,
      notes: vehicleData.notes,
      is_active: vehicleData.isActive
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/shop/vehicles/${vehicleId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      make: response.make || '',
      model: response.model || '',
      year: response.year || new Date().getFullYear(),
      vin: response.vin || '',
      licensePlate: response.license_plate || '',
      color: response.color,
      engine: response.engine,
      transmission: response.transmission,
      mileage: response.mileage,
      fuelType: response.fuel_type,
      notes: response.notes,
      isActive: response.is_active ?? true,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      lastServiceDate: response.last_service_date,
      nextServiceDue: response.next_service_due,
      repairHistory: response.repair_history || []
    };
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId: string): Promise<void> => {
    await apiDelete(`/shop/vehicles/${vehicleId}/`);
  },

  // Deactivate vehicle
  deactivateVehicle: async (vehicleId: string): Promise<Vehicle> => {
    return await vehicleMngtService.updateVehicle(vehicleId, { isActive: false });
  },

  // Activate vehicle
  activateVehicle: async (vehicleId: string): Promise<Vehicle> => {
    return await vehicleMngtService.updateVehicle(vehicleId, { isActive: true });
  },

  // Get vehicles by customer
  getVehiclesByCustomer: async (customerId: string): Promise<Vehicle[]> => {
    const query: VehicleQuery = {
      customerId,
      isActive: true,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    
    const response = await vehicleMngtService.getVehicles(query);
    return response.vehicles;
  },

  // Search vehicles
  searchVehicles: async (searchTerm: string, options: { limit?: number; customerId?: string } = {}): Promise<Vehicle[]> => {
    const query: VehicleQuery = {
      search: searchTerm,
      limit: options.limit || 10,
      isActive: true
    };
    
    if (options.customerId) {
      query.customerId = options.customerId;
    }
    
    const response = await vehicleMngtService.getVehicles(query);
    return response.vehicles;
  },

  // Get vehicle statistics
  getVehicleStats: async (): Promise<VehicleStats> => {
    const response = await apiGet<any>('/shop/vehicles/stats/');
    
    return {
      totalVehicles: response.total_vehicles || 0,
      activeVehicles: response.active_vehicles || 0,
      servicesDue: response.services_due || 0,
      averageMileage: response.average_mileage || 0,
      topMakes: response.top_makes?.map((item: any) => ({
        make: item.make || '',
        count: item.count || 0
      })) || [],
      recentlyAdded: response.recently_added?.map((vehicle: any) => ({
        id: vehicle.id?.toString() || '',
        customerId: vehicle.customer_id?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        licensePlate: vehicle.license_plate || '',
        color: vehicle.color,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuel_type,
        notes: vehicle.notes,
        isActive: vehicle.is_active ?? true,
        createdAt: vehicle.created_at || new Date().toISOString(),
        updatedAt: vehicle.updated_at || new Date().toISOString(),
        lastServiceDate: vehicle.last_service_date,
        nextServiceDue: vehicle.next_service_due,
        repairHistory: vehicle.repair_history || []
      })) || []
    };
  },

  // Get vehicle service history
  getVehicleServiceHistory: async (vehicleId: string): Promise<VehicleServiceHistory> => {
    const response = await apiGet<any>(`/shop/vehicles/${vehicleId}/service-history/`);
    
    return {
      vehicleId,
      services: response.services || [],
      totalCost: response.total_cost || 0,
      lastService: response.last_service,
      nextServiceDue: response.next_service_due,
      maintenanceReminders: response.maintenance_reminders || []
    };
  },

  // Get vehicles due for service
  getVehiclesDueForService: async (days: number = 30): Promise<Vehicle[]> => {
    const response = await apiGet<any>(`/shop/vehicles/service-due/?days=${days}`);
    
    return response.vehicles?.map((vehicle: any) => ({
      id: vehicle.id?.toString() || '',
      customerId: vehicle.customer_id?.toString() || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      vin: vehicle.vin || '',
      licensePlate: vehicle.license_plate || '',
      color: vehicle.color,
      engine: vehicle.engine,
      transmission: vehicle.transmission,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuel_type,
      notes: vehicle.notes,
      isActive: vehicle.is_active ?? true,
      createdAt: vehicle.created_at || new Date().toISOString(),
      updatedAt: vehicle.updated_at || new Date().toISOString(),
      customer: vehicle.customer ? {
        id: vehicle.customer.id?.toString() || '',
        firstName: vehicle.customer.first_name || '',
        lastName: vehicle.customer.last_name || '',
        email: vehicle.customer.email || '',
        phone: vehicle.customer.phone || ''
      } : undefined,
      lastServiceDate: vehicle.last_service_date,
      nextServiceDue: vehicle.next_service_due,
      repairHistory: vehicle.repair_history || []
    })) || [];
  },

  // Update vehicle mileage
  updateVehicleMileage: async (vehicleId: string, mileage: number): Promise<Vehicle> => {
    return await vehicleMngtService.updateVehicle(vehicleId, { mileage });
  },

  // Get vehicle by VIN
  getVehicleByVin: async (vin: string): Promise<Vehicle | null> => {
    try {
      const response = await apiGet<any>(`/shop/vehicles/vin/${vin}/`);
      
      return {
        id: response.id?.toString() || '',
        customerId: response.customer_id?.toString() || '',
        make: response.make || '',
        model: response.model || '',
        year: response.year || new Date().getFullYear(),
        vin: response.vin || '',
        licensePlate: response.license_plate || '',
        color: response.color,
        engine: response.engine,
        transmission: response.transmission,
        mileage: response.mileage,
        fuelType: response.fuel_type,
        notes: response.notes,
        isActive: response.is_active ?? true,
        createdAt: response.created_at || new Date().toISOString(),
        updatedAt: response.updated_at || new Date().toISOString(),
        customer: response.customer ? {
          id: response.customer.id?.toString() || '',
          firstName: response.customer.first_name || '',
          lastName: response.customer.last_name || '',
          email: response.customer.email || '',
          phone: response.customer.phone || ''
        } : undefined,
        lastServiceDate: response.last_service_date,
        nextServiceDue: response.next_service_due,
        repairHistory: response.repair_history || []
      };
    } catch (error) {
      return null;
    }
  }
};
