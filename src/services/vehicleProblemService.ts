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
  // Get vehicle problems with filtering using enhanced backend endpoints
  getVehicleProblems: async (query: VehicleProblemQuery = {}): Promise<VehicleProblemListResponse> => {
    try {
      let endpoint = '/shop/vehicle-problems/';
      
      // Use specialized endpoints for better performance when available
      if (query.resolved === false && !query.vehicleId) {
        // Get all unresolved problems
        endpoint = '/shop/vehicle-problems/unresolved/';
      }
      
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
      console.error('Error fetching vehicle problems:', error);
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
  },

  // ====== NEW ENHANCED API METHODS ======

  // Get all unresolved problems using specialized endpoint
  getAllUnresolvedProblems: async (): Promise<VehicleProblem[]> => {
    try {
      const response = await vehicleProblemService.getVehicleProblems({ resolved: false });
      return response.problems;
    } catch (error: any) {
      console.error('Error fetching unresolved problems:', error);
      throw error;
    }
  },

  // Get recent problems (last 30 days) for dashboard display
  getRecentProblems: async (days: number = 30): Promise<VehicleProblem[]> => {
    try {
      const response = await vehicleProblemService.getVehicleProblems({ 
        limit: 50,
        // Note: Backend would need to support date filtering for this to work optimally
      });
      
      // Client-side filtering for recent problems if backend doesn't support it yet
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return response.problems.filter(problem => {
        const problemDate = new Date(problem.reportedDate);
        return problemDate >= cutoffDate;
      });
    } catch (error: any) {
      console.error('Error fetching recent problems:', error);
      throw error;
    }
  },

  // Get problem statistics for dashboard
  getProblemStats: async (): Promise<{
    totalProblems: number;
    unresolvedProblems: number;
    resolvedProblems: number;
    recentProblems: number;
  }> => {
    try {
      // For now, we need to make separate calls. In future, backend could provide a /stats/ endpoint
      const allProblems = await vehicleProblemService.getVehicleProblems({ limit: 1000 });
      const recentProblems = await vehicleProblemService.getRecentProblems(7);
      
      const totalProblems = allProblems.total;
      const unresolvedProblems = allProblems.problems.filter(p => !p.resolved).length;
      const resolvedProblems = allProblems.problems.filter(p => p.resolved).length;
      
      return {
        totalProblems,
        unresolvedProblems,
        resolvedProblems,
        recentProblems: recentProblems.length
      };
    } catch (error: any) {
      console.error('Error fetching problem stats:', error);
      throw error;
    }
  }
};
