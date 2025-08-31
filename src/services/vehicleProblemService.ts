import { toast } from 'react-toastify';
import type { CreateVehicleProblemData, UpdateVehicleProblemData, VehicleProblem, VehicleProblemListResponse, VehicleProblemQuery, VehicleProblemResponse } from '../types/vehicles';
import { apiGet, apiPost, apiPut, apiDelete, type ApiQueryParams } from '../utils/api';

export const vehicleProblemService = {
  // Get vehicle problems with filtering using enhanced backend endpoints
  getVehicleProblems: async (query: VehicleProblemQuery = {}): Promise<{ problems: VehicleProblem[]; total: number }> => {
    try {
      let endpoint = '/shop/vehicle-problems/';
      
      // Use specialized endpoints for better performance when available
      if (query.resolved === false && !query.vehicleId) {
        // Get all unresolved problems
        endpoint = '/shop/vehicle-problems/unresolved/';
      }
      
      const response = await apiGet<VehicleProblemListResponse>(endpoint, query as ApiQueryParams);
      
      // Handle different response structures - API might return array directly or wrapped
      const problemArray = Array.isArray(response) ? response : (response.results || response.problems || response || []);
      const problems = problemArray.map((problem: VehicleProblemResponse) => ({
        id: problem.id?.toString() || '',
        description: problem.description || '',
        reportedDate: problem.reported_date || '',
        resolved: problem.resolved || false,
        vehicleId: problem.vehicle_id?.toString() || ''
      }));
      return {
        problems,
        total: response.count || problemArray.length
      };
    } catch (error: unknown) {
      toast.error(
        "Error fetching vehicle problems: " +
          (error instanceof Error ? error.message : String(error)),
        { type: "error" }
      );
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
    const response = await apiGet<VehicleProblemResponse>(`/shop/vehicle-problems/${problemId}/`);
    
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
    
    const response = await apiPost<VehicleProblemResponse>('/shop/vehicle-problems/', createData);
    
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
    const updateData: Partial<VehicleProblemResponse> = {};
    
    if (problemData.description !== undefined) updateData.description = problemData.description;
    if (problemData.resolved !== undefined) updateData.resolved = problemData.resolved;
    
    const response = await apiPut<VehicleProblemResponse>(`/shop/vehicle-problems/${problemId}/`, updateData);
    
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
    } catch (error: unknown) {
       toast.error(
        "Error fetching vehicle problems: " +
          (error instanceof Error ? error.message : String(error)),
        { type: "error" }
      );
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
        const problemDate = new Date(problem.reportedDate ?? '');
        return problemDate >= cutoffDate;
      });
    } catch (error: unknown) {
      toast.error(
        "Error fetching recent problems: " +
          (error instanceof Error ? error.message : String(error)),
        { type: "error" }
      );
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
    } catch (error: unknown) {
      toast.error(
        "Error fetching problem stats: " +
          (error instanceof Error ? error.message : String(error)),
        { type: "error" }
      );
      throw error;
    }
  }
};
