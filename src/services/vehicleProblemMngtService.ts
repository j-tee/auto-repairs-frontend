import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import type {
  VehicleProblem,
  VehicleProblemAPIResponse,
  VehicleProblemListAPIResponse,
  VehicleProblemCreateRequest,
  CreateVehicleProblemData,
  UpdateVehicleProblemData,
  VehicleProblemQuery
} from '../types/vehicles';

// Transformation helper functions
const extractTitle = (description: string): string => {
  const title = description.split('.')[0] || description;
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

const inferSeverity = (description: string): 'low' | 'medium' | 'high' | 'critical' => {
  const desc = description.toLowerCase();
  
  if (desc.includes('critical') || desc.includes('emergency') || desc.includes('dangerous')) {
    return 'critical';
  }
  if (desc.includes('urgent') || desc.includes('leak') || desc.includes('brake')) {
    return 'high';
  }
  if (desc.includes('noise') || desc.includes('warning') || desc.includes('light')) {
    return 'medium';
  }
  return 'low';
};

const estimateResolvedDate = (reportedDate: string): string => {
  // Add 3-7 days to reported date as estimate
  const reported = new Date(reportedDate);
  const resolved = new Date(reported.getTime() + (Math.random() * 4 + 3) * 24 * 60 * 60 * 1000);
  return resolved.toISOString();
};

const transformProblemData = (backendData: VehicleProblemAPIResponse): VehicleProblem => {
  return {
    // Direct mappings with type conversion
    id: backendData.id.toString(),
    vehicleId: backendData.vehicle.id.toString(),
    description: backendData.description,
    reportedDate: backendData.reported_date,
    reported_date: backendData.reported_date,
    
    // Transform resolved boolean to status
    status: backendData.resolved ? 'resolved' : 'open',
    resolved: backendData.resolved,
    
    // Generate missing fields from description
    title: extractTitle(backendData.description),
    severity: inferSeverity(backendData.description),
    
    // Provide defaults for missing complex fields
    estimatedCost: undefined,
    actualCost: undefined,
    resolvedDate: backendData.resolved ? estimateResolvedDate(backendData.reported_date) : undefined,
    notes: '',
    isActive: true,
    createdAt: backendData.reported_date,
    updatedAt: backendData.reported_date,
    
    // Vehicle details - store full vehicle object
    vehicle: backendData.vehicle
  };
};

const transformToBackend = (frontendData: CreateVehicleProblemData | UpdateVehicleProblemData): VehicleProblemCreateRequest => {
  let description = frontendData.description || '';
  
  // If we have title and notes, combine them
  if ('title' in frontendData && frontendData.title && frontendData.title !== extractTitle(description)) {
    description = frontendData.title + (frontendData.notes ? `: ${frontendData.notes}` : '');
  }
  
  return {
    vehicle_id: parseInt(frontendData.vehicleId || '0'),
    description: description,
    resolved: 'status' in frontendData ? frontendData.status === 'resolved' : false
  };
};

// Vehicle Problems Management Service
export const vehicleProblemMngtService = {
  // Get all vehicle problems
  getVehicleProblems: async (query: VehicleProblemQuery = {}): Promise<VehicleProblem[]> => {
    try {
      console.log('🔄 Loading vehicle problems from backend...');
      
      const params = new URLSearchParams();
      
      if (query.vehicleId) params.append('vehicle', query.vehicleId);
      if (query.status === 'resolved') params.append('resolved', 'true');
      if (query.status === 'open') params.append('resolved', 'false');
      if (query.search) params.append('search', query.search);
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.offset) params.append('offset', query.offset.toString());
      
      const endpoint = `/shop/vehicle-problems/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiGet<VehicleProblemListAPIResponse>(endpoint);
      
      console.log(`✅ Loaded ${response.results.length} vehicle problems from backend`);
      return response.results.map(transformProblemData);
      
    } catch (error: unknown) {
      console.error('❌ Error loading vehicle problems:', error);
      throw error;
    }
  },

  // Get vehicle problem by ID
  getVehicleProblemById: async (problemId: string): Promise<VehicleProblem> => {
    try {
      console.log(`🔄 Loading vehicle problem ${problemId} from backend...`);
      
      const response = await apiGet<VehicleProblemAPIResponse>(`/shop/vehicle-problems/${problemId}/`);
      
      console.log(`✅ Loaded vehicle problem ${problemId} from backend`);
      return transformProblemData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading vehicle problem ${problemId}:`, error);
      throw error;
    }
  },

  // Create new vehicle problem
  createVehicleProblem: async (problemData: CreateVehicleProblemData): Promise<VehicleProblem> => {
    try {
      console.log('🔄 Creating vehicle problem...');
      
      const backendData = transformToBackend(problemData);
      const response = await apiPost<VehicleProblemAPIResponse>('/shop/vehicle-problems/', backendData);
      
      console.log(`✅ Created vehicle problem ${response.id}`);
      return transformProblemData(response);
      
    } catch (error: unknown) {
      console.error('❌ Error creating vehicle problem:', error);
      throw error;
    }
  },

  // Update vehicle problem
  updateVehicleProblem: async (problemId: string, problemData: UpdateVehicleProblemData): Promise<VehicleProblem> => {
    try {
      console.log(`🔄 Updating vehicle problem ${problemId}...`);
      
      const backendData = transformToBackend(problemData);
      const response = await apiPut<VehicleProblemAPIResponse>(`/shop/vehicle-problems/${problemId}/`, backendData);
      
      console.log(`✅ Updated vehicle problem ${problemId}`);
      return transformProblemData(response);
      
    } catch (error: unknown) {
      console.error(`❌ Error updating vehicle problem ${problemId}:`, error);
      throw error;
    }
  },

  // Delete vehicle problem
  deleteVehicleProblem: async (problemId: string): Promise<void> => {
    try {
      console.log(`🔄 Deleting vehicle problem ${problemId}...`);
      
      await apiDelete(`/shop/vehicle-problems/${problemId}/`);
      
      console.log(`✅ Deleted vehicle problem ${problemId}`);
      
    } catch (error: unknown) {
      console.error(`❌ Error deleting vehicle problem ${problemId}:`, error);
      throw error;
    }
  },

  // Get unresolved problems
  getUnresolvedProblems: async (): Promise<VehicleProblem[]> => {
    try {
      console.log('🔄 Loading unresolved problems from backend...');
      
      const response = await apiGet<VehicleProblemAPIResponse[]>('/shop/vehicle-problems/unresolved/');
      
      console.log(`✅ Loaded ${response.length} unresolved problems`);
      return response.map(transformProblemData);
      
    } catch (error: unknown) {
      console.error('❌ Error loading unresolved problems:', error);
      throw error;
    }
  },

  // Get problems by vehicle
  getProblemsByVehicle: async (vehicleId: string): Promise<VehicleProblem[]> => {
    try {
      console.log(`🔄 Loading problems for vehicle ${vehicleId}...`);
      
      const response = await apiGet<VehicleProblemAPIResponse[]>(`/shop/vehicles/${vehicleId}/problems/`);
      
      console.log(`✅ Loaded ${response.length} problems for vehicle ${vehicleId}`);
      return response.map(transformProblemData);
      
    } catch (error: unknown) {
      console.error(`❌ Error loading problems for vehicle ${vehicleId}:`, error);
      // Fallback to filtering by vehicleId
      return vehicleProblemMngtService.getVehicleProblems({ vehicleId });
    }
  },

  // Resolve problem
  resolveProblem: async (problemId: string, actualCost?: number, notes?: string): Promise<VehicleProblem> => {
    try {
      console.log(`🔄 Resolving vehicle problem ${problemId}...`);
      
      const updateData: UpdateVehicleProblemData = {
        status: 'resolved',
        resolvedDate: new Date().toISOString()
      };
      
      if (actualCost !== undefined) updateData.actualCost = actualCost;
      if (notes !== undefined) updateData.notes = notes;
      
      const result = await vehicleProblemMngtService.updateVehicleProblem(problemId, updateData);
      
      console.log(`✅ Resolved vehicle problem ${problemId}`);
      return result;
      
    } catch (error: unknown) {
      console.error(`❌ Error resolving vehicle problem ${problemId}:`, error);
      throw error;
    }
  }
};
