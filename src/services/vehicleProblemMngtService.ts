import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Vehicle Problem types
export interface VehicleProblem {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedDate: string;
  resolvedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Related data
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

export interface CreateVehicleProblemData {
  vehicleId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  notes?: string;
}

export interface UpdateVehicleProblemData {
  vehicleId?: string;
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  resolvedDate?: string;
}

export interface VehicleProblemQuery {
  vehicleId?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

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
    
    const endpoint = `/vehicle-problems/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiGet<any>(endpoint);
    
    // Handle both paginated and non-paginated responses
    const problems = response.results || response;
    
    return problems.map((problem: any): VehicleProblem => ({
      id: problem.id?.toString() || '',
      vehicleId: problem.vehicle_id?.toString() || problem.vehicle?.toString() || '',
      title: problem.title || '',
      description: problem.description || '',
      severity: problem.severity || 'medium',
      status: problem.status || 'open',
      reportedDate: problem.reported_date || problem.reportedDate || new Date().toISOString(),
      resolvedDate: problem.resolved_date || problem.resolvedDate,
      estimatedCost: problem.estimated_cost ? parseFloat(problem.estimated_cost) : undefined,
      actualCost: problem.actual_cost ? parseFloat(problem.actual_cost) : undefined,
      notes: problem.notes || '',
      isActive: problem.is_active ?? true,
      createdAt: problem.created_at || problem.createdAt || new Date().toISOString(),
      updatedAt: problem.updated_at || problem.updatedAt || new Date().toISOString(),
      vehicle: problem.vehicle_details ? {
        id: problem.vehicle_details.id?.toString() || '',
        make: problem.vehicle_details.make || '',
        model: problem.vehicle_details.model || '',
        year: parseInt(problem.vehicle_details.year) || 0,
        licensePlate: problem.vehicle_details.license_plate || problem.vehicle_details.licensePlate || ''
      } : undefined
    }));
  },

  // Get vehicle problem by ID
  getVehicleProblemById: async (problemId: string): Promise<VehicleProblem> => {
    const response = await apiGet<any>(`/vehicle-problems/${problemId}/`);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date || response.reportedDate || new Date().toISOString(),
      resolvedDate: response.resolved_date || response.resolvedDate,
      estimatedCost: response.estimated_cost ? parseFloat(response.estimated_cost) : undefined,
      actualCost: response.actual_cost ? parseFloat(response.actual_cost) : undefined,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
      vehicle: response.vehicle_details ? {
        id: response.vehicle_details.id?.toString() || '',
        make: response.vehicle_details.make || '',
        model: response.vehicle_details.model || '',
        year: parseInt(response.vehicle_details.year) || 0,
        licensePlate: response.vehicle_details.license_plate || response.vehicle_details.licensePlate || ''
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
    
    const response = await apiPost<any>('/vehicle-problems/', createData);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date || response.reportedDate || new Date().toISOString(),
      resolvedDate: response.resolved_date || response.resolvedDate,
      estimatedCost: response.estimated_cost ? parseFloat(response.estimated_cost) : undefined,
      actualCost: response.actual_cost ? parseFloat(response.actual_cost) : undefined,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString()
    };
  },

  // Update vehicle problem
  updateVehicleProblem: async (problemId: string, problemData: UpdateVehicleProblemData): Promise<VehicleProblem> => {
    const updateData: any = {};
    
    if (problemData.vehicleId !== undefined) updateData.vehicle_id = problemData.vehicleId;
    if (problemData.title !== undefined) updateData.title = problemData.title;
    if (problemData.description !== undefined) updateData.description = problemData.description;
    if (problemData.severity !== undefined) updateData.severity = problemData.severity;
    if (problemData.status !== undefined) updateData.status = problemData.status;
    if (problemData.estimatedCost !== undefined) updateData.estimated_cost = problemData.estimatedCost;
    if (problemData.actualCost !== undefined) updateData.actual_cost = problemData.actualCost;
    if (problemData.notes !== undefined) updateData.notes = problemData.notes;
    if (problemData.resolvedDate !== undefined) updateData.resolved_date = problemData.resolvedDate;
    
    const response = await apiPut<any>(`/vehicle-problems/${problemId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || response.vehicle?.toString() || '',
      title: response.title || '',
      description: response.description || '',
      severity: response.severity || 'medium',
      status: response.status || 'open',
      reportedDate: response.reported_date || response.reportedDate || new Date().toISOString(),
      resolvedDate: response.resolved_date || response.resolvedDate,
      estimatedCost: response.estimated_cost ? parseFloat(response.estimated_cost) : undefined,
      actualCost: response.actual_cost ? parseFloat(response.actual_cost) : undefined,
      notes: response.notes || '',
      isActive: response.is_active ?? true,
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString()
    };
  },

  // Delete vehicle problem
  deleteVehicleProblem: async (problemId: string): Promise<void> => {
    await apiDelete(`/vehicle-problems/${problemId}/`);
  },

  // Get unresolved problems
  getUnresolvedProblems: async (): Promise<VehicleProblem[]> => {
    const response = await apiGet<any>('/vehicle-problems/unresolved/');
    const problems = response.results || response;
    
    return problems.map((problem: any): VehicleProblem => ({
      id: problem.id?.toString() || '',
      vehicleId: problem.vehicle_id?.toString() || problem.vehicle?.toString() || '',
      title: problem.title || '',
      description: problem.description || '',
      severity: problem.severity || 'medium',
      status: problem.status || 'open',
      reportedDate: problem.reported_date || problem.reportedDate || new Date().toISOString(),
      resolvedDate: problem.resolved_date || problem.resolvedDate,
      estimatedCost: problem.estimated_cost ? parseFloat(problem.estimated_cost) : undefined,
      actualCost: problem.actual_cost ? parseFloat(problem.actual_cost) : undefined,
      notes: problem.notes || '',
      isActive: problem.is_active ?? true,
      createdAt: problem.created_at || problem.createdAt || new Date().toISOString(),
      updatedAt: problem.updated_at || problem.updatedAt || new Date().toISOString(),
      vehicle: problem.vehicle_details ? {
        id: problem.vehicle_details.id?.toString() || '',
        make: problem.vehicle_details.make || '',
        model: problem.vehicle_details.model || '',
        year: parseInt(problem.vehicle_details.year) || 0,
        licensePlate: problem.vehicle_details.license_plate || problem.vehicle_details.licensePlate || ''
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
