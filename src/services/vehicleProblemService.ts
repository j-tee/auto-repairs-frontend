import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export interface VehicleProblem {
  id: string;
  description: string;
  reportedDate: string;
  resolved: boolean;
  vehicleId: string;
}

export interface CreateVehicleProblemData {
  description: string;
  vehicleId: string;
}

export interface UpdateVehicleProblemData {
  description?: string;
  resolved?: boolean;
}

export interface VehicleProblemQuery {
  vehicleId?: string;
  resolved?: boolean;
  limit?: number;
  offset?: number;
  [key: string]: any; // Index signature for API compatibility
}

export interface VehicleProblemListResponse {
  problems: VehicleProblem[];
  total: number;
}

export const vehicleProblemService = {
  // Get vehicle problems with filtering
  getVehicleProblems: async (query: VehicleProblemQuery = {}): Promise<VehicleProblemListResponse> => {
    try {
      const endpoint = '/shop/vehicle-problems/';
      const response = await apiGet<any>(endpoint, query);
      
      // Handle different response structures - API might return array directly or wrapped
      const problemArray = Array.isArray(response) ? response : (response.results || response.problems || response || []);
      
      return {
        problems: problemArray.map((problem: any) => ({
          id: problem.id?.toString() || '',
          description: problem.description || '',
          reportedDate: problem.reported_date || problem.reportedDate || '',
          resolved: problem.resolved || false,
          vehicleId: problem.vehicle_id?.toString() || problem.vehicleId || ''
        })),
        total: response.count || problemArray.length
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Get problems for a specific vehicle
  getVehicleProblemsForVehicle: async (vehicleId: string): Promise<VehicleProblem[]> => {
    const response = await vehicleProblemService.getVehicleProblems({ vehicleId });
    return response.problems;
  },

  // Get unresolved problems for a vehicle
  getUnresolvedProblemsForVehicle: async (vehicleId: string): Promise<VehicleProblem[]> => {
    const response = await vehicleProblemService.getVehicleProblems({ 
      vehicleId, 
      resolved: false 
    });
    return response.problems;
  },

  // Get problem by ID
  getVehicleProblemById: async (problemId: string): Promise<VehicleProblem> => {
    const response = await apiGet<any>(`/shop/vehicle-problems/${problemId}/`);
    
    return {
      id: response.id?.toString() || '',
      description: response.description || '',
      reportedDate: response.reported_date || '',
      resolved: response.resolved || false,
      vehicleId: response.vehicle_id?.toString() || ''
    };
  },

  // Create new vehicle problem
  createVehicleProblem: async (problemData: CreateVehicleProblemData): Promise<VehicleProblem> => {
    const createData = {
      description: problemData.description,
      vehicle_id: parseInt(problemData.vehicleId),
      resolved: false
    };
    
    const response = await apiPost<any>('/shop/vehicle-problems/', createData);
    
    return {
      id: response.id?.toString() || '',
      description: response.description || '',
      reportedDate: response.reported_date || new Date().toISOString(),
      resolved: response.resolved || false,
      vehicleId: response.vehicle_id?.toString() || ''
    };
  },

  // Update vehicle problem
  updateVehicleProblem: async (problemId: string, problemData: UpdateVehicleProblemData): Promise<VehicleProblem> => {
    const updateData: any = {};
    
    if (problemData.description !== undefined) updateData.description = problemData.description;
    if (problemData.resolved !== undefined) updateData.resolved = problemData.resolved;
    
    const response = await apiPut<any>(`/shop/vehicle-problems/${problemId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      description: response.description || '',
      reportedDate: response.reported_date || '',
      resolved: response.resolved || false,
      vehicleId: response.vehicle_id?.toString() || ''
    };
  },

  // Mark problem as resolved
  markProblemResolved: async (problemId: string): Promise<VehicleProblem> => {
    return await vehicleProblemService.updateVehicleProblem(problemId, { resolved: true });
  },

  // Mark problem as unresolved
  markProblemUnresolved: async (problemId: string): Promise<VehicleProblem> => {
    return await vehicleProblemService.updateVehicleProblem(problemId, { resolved: false });
  },

  // Delete vehicle problem
  deleteVehicleProblem: async (problemId: string): Promise<void> => {
    await apiDelete(`/shop/vehicle-problems/${problemId}/`);
  }
};
