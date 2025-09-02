import type { CreateVehicleProblemData, UpdateVehicleProblemData, VehicleProblem, VehicleProblemListResponse, VehicleProblemQuery, VehicleProblemResponse } from '../types/vehicles';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Vehicle Problem types


// Vehicle Problems Management Service
export const vehicleProblemMngtService = {
  // Get all vehicle problems
  getVehicleProblems: async (query: VehicleProblemQuery = {}): Promise<VehicleProblem[]> => {
    const params = new URLSearchParams();
    
    if (query.vehicleId) params.append('vehicle_id', query.vehicleId);
    if (query.status) params.append('status', query.status);
    if (query.severity) params.append('severity', query.severity);
    if (query.search) params.append('search', query.search);
    if (query.dateFrom) params.append('date_from', query.dateFrom);
    if (query.dateTo) params.append('date_to', query.dateTo);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    
    const endpoint = `/shop/vehicle-problems/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiGet<VehicleProblemListResponse>(endpoint);
    
    // Handle both paginated and non-paginated responses
    const problems = response.results || response;
    
    return problems.map((problem: VehicleProblemResponse): VehicleProblem => ({
      id: problem.id?.toString() || '',
      vehicleId: problem.vehicle_id?.toString() || problem.vehicle?.toString() || '',
      title: problem.title || '',
      description: problem.description || '',
      severity: problem.severity || 'medium',
      status: problem.status || 'open',
      reportedDate: problem.reported_date, //|| problem.reportedDate || new Date().toISOString(),
      resolvedDate: problem.resolved_date,// || problem.resolvedDate,
      estimatedCost: problem.estimated_cost,// ? parseFloat(problem.estimated_cost) : undefined,
      actualCost: problem.actual_cost,// ? parseFloat(problem.actual_cost) : undefined,
      notes: problem.notes || '',
      isActive: problem.is_active ?? true,
      createdAt: problem.created_at, //|| problem.createdAt || new Date().toISOString(),
      updatedAt: problem.updated_at,// || problem.updatedAt || new Date().toISOString(),
      vehicle: problem.vehicle_details ? {
        id: problem.vehicle_details.id?.toString() || '',
        vin: problem.vehicle_details.vin || '',
        make: problem.vehicle_details.make || '',
        model: problem.vehicle_details.model || '',
        year: problem.vehicle_details.year || 0,
        licensePlate: problem.vehicle_details.license_plate || '',
        customerId: problem.vehicle_details.customer_id || '',
        color: problem.vehicle_details.color || undefined,
        mileage: problem.vehicle_details.mileage ,
        engine: problem.vehicle_details.engine || undefined,
        transmission?: problem.vehicle_details.transmission || undefined,
        fuelType: problem.vehicle_details.fuel_type || undefined,
        createdAt: problem.vehicle_details.created_at ,
        updatedAt: problem.vehicle_details.updated_at 
      } : undefined
    }));
  },

  // Get vehicle problem by ID
  getVehicleProblemById: async (problemId: string): Promise<VehicleProblem> => {
    const response = await apiGet<VehicleProblemResponse>(`/shop/vehicle-problems/${problemId}/`);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date ,
      resolvedDate: response.resolved_date,
      estimatedCost: response.estimated_cost,
      actualCost: response.actual_cost ,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at ,
      updatedAt: response.updated_at ,
      vehicle: response.vehicle_details ? {
        id: response.vehicle_details.id?.toString() || '',
        vin: response.vehicle_details.vin || '',
        make: response.vehicle_details.make || '',
        model: response.vehicle_details.model || '',
        year: response.vehicle_details.year || 0,
        licensePlate: response.vehicle_details.license_plate  || '',
        customerId: response.vehicle_details.customer_id || '',
        color: response.vehicle_details.color || undefined,
        mileage: response.vehicle_details.mileage ,
        engine: response.vehicle_details.engine || undefined,
        transmission?: response.vehicle_details.transmission || undefined,
        fuelType: response.vehicle_details.fuel_type || undefined,
        createdAt: response.vehicle_details.created_at ,
        updatedAt: response.vehicle_details.updated_at
        
      } : undefined
    };
  },

  // Create new vehicle problem
  createVehicleProblem: async (problemData: CreateVehicleProblemData): Promise<VehicleProblem> => {
    const createData = {
      vehicle_id: problemData.vehicleId,
      title: problemData.title,
      description: problemData.description,
      severity: problemData.severity,
      estimated_cost: problemData.estimatedCost,
      notes: problemData.notes,
      status: 'open' as const,
      reported_date: new Date().toISOString()
    };
    
    const response = await apiPost<VehicleProblemResponse>('/shop/vehicle-problems/', createData);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date ,
      resolvedDate: response.resolved_date ,
      estimatedCost: response.estimated_cost,
      actualCost: response.actual_cost ,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at,
      updatedAt: response.updated_at 
    };
  },

  // Update vehicle problem
  updateVehicleProblem: async (problemId: string, problemData: UpdateVehicleProblemData): Promise<VehicleProblem> => {
    const updateData: Partial<VehicleProblemResponse> = {};
    
    if (problemData.vehicleId !== undefined) updateData.vehicle_id = problemData.vehicleId;
    if (problemData.title !== undefined) updateData.title = problemData.title;
    if (problemData.description !== undefined) updateData.description = problemData.description;
    if (problemData.severity !== undefined) updateData.severity = problemData.severity;
    if (problemData.status !== undefined) updateData.status = problemData.status;
    if (problemData.estimatedCost !== undefined) updateData.estimated_cost = problemData.estimatedCost;
    if (problemData.actualCost !== undefined) updateData.actual_cost = problemData.actualCost;
    if (problemData.notes !== undefined) updateData.notes = problemData.notes;
    if (problemData.resolvedDate !== undefined) updateData.resolved_date = problemData.resolvedDate;
    
    const response = await apiPut<VehicleProblemResponse>(`/shop/vehicle-problems/${problemId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date ,
      resolvedDate: response.resolved_date ,
      estimatedCost: response.estimated_cost,
      actualCost: response.actual_cost ,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at ,
      updatedAt: response.updated_at 
    };
  },

  // Delete vehicle problem
  deleteVehicleProblem: async (problemId: string): Promise<void> => {
    await apiDelete(`/shop/vehicle-problems/${problemId}/`);
  },

  // Get unresolved problems
  getUnresolvedProblems: async (): Promise<VehicleProblem[]> => {
    const response = await apiGet<VehicleProblemListResponse>('/shop/vehicle-problems/unresolved/');
    const problems = response.results || response;
    
    return problems.map((problem: VehicleProblemResponse): VehicleProblem => ({
      id: problem.id?.toString() || '',
      vehicleId: problem.vehicle_id?.toString() || problem.vehicle?.toString() || '',
      title: problem.title || '',
      description: problem.description || '',
      severity: problem.severity || 'medium',
      status: problem.status || 'open',
      reportedDate: problem.reported_date ,
      resolvedDate: problem.resolved_date ,
      estimatedCost: problem.estimated_cost,
      actualCost: problem.actual_cost ,
      notes: problem.notes || '',
      isActive: problem.is_active ?? true,
      createdAt: problem.created_at ,
      updatedAt: problem.updated_at ,
      vehicle: problem.vehicle_details ? {
        id: problem.vehicle_details.id?.toString() || '',
        vin: problem.vehicle_details.vin || '',
        make: problem.vehicle_details.make || '',
        model: problem.vehicle_details.model || '',
        year: problem.vehicle_details.year || 0,
        licensePlate: problem.vehicle_details.license_plate || '',
        customerId: problem.vehicle_details.customer_id || '',
        color: problem.vehicle_details.color || undefined,
        mileage: problem.vehicle_details.mileage ,
        engine: problem.vehicle_details.engine || undefined,
        transmission?: problem.vehicle_details.transmission || undefined,
        fuelType: problem.vehicle_details.fuel_type || undefined,
        createdAt: problem.vehicle_details.created_at ,
        updatedAt: problem.vehicle_details.updated_at
      } : undefined
    }));
  },

  // Get problems by vehicle
  getProblemsByVehicle: async (vehicleId: string): Promise<VehicleProblem[]> => {
    return vehicleProblemMngtService.getVehicleProblems({ vehicleId });
  },

  // Resolve problem
  resolveProblem: async (problemId: string, actualCost?: number, notes?: string): Promise<VehicleProblem> => {
    const updateData: UpdateVehicleProblemData = {
      status: 'resolved',
      resolvedDate: new Date().toISOString()
    };
    
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (notes !== undefined) updateData.notes = notes;
    
    return vehicleProblemMngtService.updateVehicleProblem(problemId, updateData);
  }
};
