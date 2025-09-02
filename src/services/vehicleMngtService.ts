import { toast } from 'react-toastify';
import type { CreateVehicleData, TopMake, UpdateVehicleData, Vehicle, VehicleList, VehicleListResponse,  VehicleProblemQuery, VehicleResponse, VehicleServiceHistory, VehicleServiceHistoryResponse, VehicleStats, VehicleStatsResponse } from '../types/vehicles';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Vehicle Management Service
export const vehicleMngtService = {
  // Get all vehicles with filtering and pagination
  getVehicles: async (query: VehicleProblemQuery = {}): Promise<VehicleList> => {
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
    
    const response = await apiGet<VehicleListResponse>(endpoint);
    
    // Handle different response structures - API might return array directly or wrapped
    const vehicleArray = Array.isArray(response) ? response : (response.results || response || []);
    
    return {
      vehicles: vehicleArray.map((vehicle: VehicleResponse) => ({
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
          name: vehicle.customer.name,
          email: vehicle.customer.email || '',
          phone: vehicle.customer.phone_number || ''
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

  // Get vehicles for a specific customer using enhanced backend filtering
  getCustomerVehicles: async (customerId: string): Promise<Vehicle[]> => {
    try {
      toast.info(`Loading vehicles for customer: ${customerId}`);
      
      // Try the new nested route approach first (recommended by backend team)
      try {
        const response = await apiGet<VehicleResponse[]>(`/shop/customers/${customerId}/vehicles/`);
        
        const customerVehicles = response.map((vehicle: VehicleResponse) => ({
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
            name: vehicle.customer.name ,
            email: vehicle.customer.email || '',
            phone: vehicle.customer.phone_number,
          } : undefined,
          lastServiceDate: vehicle.last_service_date,
          nextServiceDue: vehicle.next_service_due,
          repairHistory: vehicle.repair_history || []
        }));
        
        toast.info(`Nested route returned ${customerVehicles.length} vehicles for customer ${customerId}`);
        return customerVehicles;
      } catch (nestedError) {
        toast.info(
          'Nested route failed, trying alternative endpoint...' +
          ((nestedError && typeof nestedError === 'object' && 'message' in nestedError)
            ? (nestedError as { message?: string }).message
            : '')
        );
        
        // Fallback to action endpoint
        try {
          const response = await apiGet<VehicleResponse[]>(`/shop/vehicles/by_customer/`, { customer_id: customerId });
          
          const customerVehicles = response.map((vehicle: VehicleResponse) => ({
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
              name: vehicle.customer.name ,
              email: vehicle.customer.email || '',
              phone: vehicle.customer.phone_number || ''
            } : undefined,
            lastServiceDate: vehicle.last_service_date,
            nextServiceDue: vehicle.next_service_due,
            repairHistory: vehicle.repair_history || []
          }));
          
          toast.info(`Action endpoint returned ${customerVehicles.length} vehicles for customer ${customerId}`);
          return customerVehicles;
        } catch (actionError) {
          toast.info('Action endpoint failed, trying query parameter approach...'+actionError);
          
          // Final fallback to original query parameter approach
          const response = await vehicleMngtService.getVehicles({
            customerId,
            isActive: true,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 100
          });
          
          const customerVehicles = response.vehicles || [];
          toast.info(`Query parameter approach returned ${customerVehicles.length} vehicles for customer ${customerId}`);
          return customerVehicles;
        }
      }
    } catch (error: unknown) {
      toast.error('Error loading customer vehicles: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  },
  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const response = await apiGet<VehicleResponse>(`/shop/vehicles/${vehicleId}/`);
    
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
        name: response.customer.name,        
        email: response.customer.email || '',
        phone: response.customer.phone_number 
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
      fuel_type: vehicleData.fuel_type,
      notes: vehicleData.notes
    };
    
    const response = await apiPost<VehicleResponse>('/shop/vehicles/', createData);
    
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
        name: response.customer.name ,
        email: response.customer.email || '',
        phone: response.customer.phone_number 
      } : undefined,
      lastServiceDate: response.last_service_date,
      nextServiceDue: response.next_service_due,
      repairHistory: response.repair_history || []
    };
  },

  // Update vehicle
  updateVehicle: async (vehicleId: string, vehicleData: UpdateVehicleData): Promise<Vehicle> => {
    const updateData = {
      customer_id: vehicleData.customer_id,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      vin: vehicleData.vin,
      license_plate: vehicleData.license_plate,
      color: vehicleData.color,
      engine: vehicleData.engine,
      transmission: vehicleData.transmission,
      mileage: vehicleData.mileage,
      fuel_type: vehicleData.fuel_type,
      notes: vehicleData.notes,
      is_active: vehicleData.is_active
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<VehicleResponse>(`/shop/vehicles/${vehicleId}/`, updateData);
    
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
        name: response.customer.name ,
        email: response.customer.email || '',
        phone: response.customer.phone_number 
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
    return await vehicleMngtService.updateVehicle(vehicleId, { is_active: false });
  },

  // Activate vehicle
  activateVehicle: async (vehicleId: string): Promise<Vehicle> => {
    return await vehicleMngtService.updateVehicle(vehicleId, { is_active: true });
  },

  // Get vehicles by customer
  getVehiclesByCustomer: async (customerId: string): Promise<Vehicle[]> => {
    const query: VehicleProblemQuery = {
      customerId,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    const response = await vehicleMngtService.getVehicles(query);
    return response.vehicles;
  },

  // Search vehicles
  searchVehicles: async (searchTerm: string, options: { limit?: number; customerId?: string } = {}): Promise<Vehicle[]> => {
    const query: VehicleProblemQuery = {
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
    const response = await apiGet<VehicleStatsResponse>('/shop/vehicles/stats/');
    
    return {
      totalVehicles: response.total_vehicles || 0,
      activeVehicles: response.active_vehicles || 0,
      servicesDue: response.services_due || 0,
      averageMileage: response.average_mileage || 0,
      topMakes: response.top_makes?.map((item: TopMake) => ({
        make: item.make || '',
        count: item.count || 0
      })) || [],
      recentlyAdded: response.recently_added?.map((vehicle: VehicleResponse) => ({
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
    const response = await apiGet<VehicleServiceHistoryResponse>(`/shop/vehicles/${vehicleId}/service-history/`);
    
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
    const response = await apiGet<VehicleListResponse>(`/shop/vehicles/service-due/?days=${days}`);
    
    return response.vehicles?.map((vehicle: VehicleResponse) => ({
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
        name: vehicle.customer.name ,
        email: vehicle.customer.email || '',
        phone: vehicle.customer.phone_number 
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
      const response = await apiGet<VehicleResponse>(`/shop/vehicles/vin/${vin}/`);
      
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
          name: response.customer.name ,
          email: response.customer.email || '',
          phone: response.customer.phone_number 
        } : undefined,
        lastServiceDate: response.last_service_date,
        nextServiceDue: response.next_service_due,
        repairHistory: response.repair_history || []
      };
    } catch (error) {
      toast.error('Error fetching vehicle by VIN: ' + (error instanceof Error ? error.message : String(error)));
      return null;
    }
  }
};
