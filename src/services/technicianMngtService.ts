import type {
  Technician,
  TechniciansResponse,
  WorkloadOverview,
  WorkloadResponse,
  AssignmentRequest,
  AssignmentResponse,
  TechnicianQuery,
  TechnicianServiceResponse,
  TechnicianCache,
  TechnicianCacheEntry
} from '../types/technicians';
import { apiGet, apiPost } from '../utils/api';

// Smart caching implementation
class TechnicianCacheManager {
  private cache: TechnicianCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set<T>(key: keyof TechnicianCache, data: T): void {
    const now = Date.now();
    this.cache[key] = {
      data,
      timestamp: now,
      expiry: now + this.CACHE_DURATION
    } as TechnicianCacheEntry<T>;
  }

  get<T>(key: keyof TechnicianCache): T | null {
    const entry = this.cache[key] as TechnicianCacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      delete this.cache[key];
      return null;
    }
    
    return entry.data;
  }

  invalidate(key?: keyof TechnicianCache): void {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }

  isExpired(key: keyof TechnicianCache): boolean {
    const entry = this.cache[key];
    return !entry || Date.now() > entry.expiry;
  }
}

// Initialize cache manager
const cacheManager = new TechnicianCacheManager();

// Technician Management Service
export const technicianMngtService = {
  /**
   * Get all technicians with optional filtering
   */
  getTechnicians: async (
    query: TechnicianQuery = {},
    forceRefresh = false
  ): Promise<Technician[]> => {
    const cacheKey = 'technicians';
    
    // Check cache first
    if (!forceRefresh && !cacheManager.isExpired(cacheKey)) {
      const cached = cacheManager.get<Technician[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      params.append('role', 'technician'); // Always filter for technicians

      if (query.is_available !== undefined) {
        params.append('is_available', query.is_available.toString());
      }
      if (query.workload_count__lte !== undefined) {
        params.append('workload_count__lte', query.workload_count__lte.toString());
      }
      if (query.shop) {
        params.append('shop', query.shop.toString());
      }

      const queryString = params.toString();
      const endpoint = `/shop/employees/${queryString ? `?${queryString}` : '?role=technician'}`;

      const response = await apiGet<TechniciansResponse>(endpoint);
      
      // Transform response to ensure consistent data structure
      const technicians = Array.isArray(response) ? response : [];
      
      // Cache the results
      cacheManager.set(cacheKey, technicians);
      
      return technicians;
    } catch (error) {
      throw new Error(`Failed to fetch technicians: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get available technicians only
   */
  getAvailableTechnicians: async (forceRefresh = false): Promise<Technician[]> => {
    return await technicianMngtService.getTechnicians(
      { is_available: true },
      forceRefresh
    );
  },

  /**
   * Get technician workload overview
   */
  getWorkloadOverview: async (forceRefresh = false): Promise<WorkloadOverview> => {
    const cacheKey = 'workload';
    
    // Check cache first
    if (!forceRefresh && !cacheManager.isExpired(cacheKey)) {
      const cached = cacheManager.get<WorkloadOverview>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await apiGet<WorkloadResponse>('/shop/technicians/workload/');
      
      // Cache the results
      cacheManager.set(cacheKey, response);
      
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch workload overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Assign technician to appointment
   */
  assignTechnician: async (
    appointmentId: number,
    technicianId: number
  ): Promise<AssignmentResponse> => {
    try {
      const requestData: AssignmentRequest = {
        technician_id: technicianId
      };

      const response = await apiPost<AssignmentResponse>(
        `/shop/appointments/${appointmentId}/assign-technician/`,
        requestData
      );

      // Invalidate caches after successful assignment
      cacheManager.invalidate();
      
      return response;
    } catch (error) {
      throw new Error(`Failed to assign technician: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Start work on appointment
   */
  startWork: async (appointmentId: number): Promise<void> => {
    try {
      await apiPost(`/shop/appointments/${appointmentId}/start-work/`, {});
      
      // Invalidate caches after status change
      cacheManager.invalidate();
    } catch (error) {
      throw new Error(`Failed to start work: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Complete work on appointment
   */
  completeWork: async (appointmentId: number): Promise<void> => {
    try {
      await apiPost(`/shop/appointments/${appointmentId}/complete-work/`, {});
      
      // Invalidate caches after status change
      cacheManager.invalidate();
    } catch (error) {
      throw new Error(`Failed to complete work: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Unassign technician from appointment
   */
  unassignTechnician: async (appointmentId: number): Promise<void> => {
    try {
      await apiPost(`/shop/appointments/${appointmentId}/unassign-technician/`, {});
      
      // Invalidate caches after unassignment
      cacheManager.invalidate();
    } catch (error) {
      throw new Error(`Failed to unassign technician: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get technician by ID
   */
  getTechnicianById: async (technicianId: number): Promise<Technician | null> => {
    try {
      const technicians = await technicianMngtService.getTechnicians();
      return technicians.find(tech => tech.id === technicianId) || null;
    } catch (error) {
      throw new Error(`Failed to get technician by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Find best available technician for assignment
   */
  findBestTechnician: async (appointmentId?: number): Promise<Technician | null> => {
    try {
      const technicians = await technicianMngtService.getAvailableTechnicians();
      
      if (technicians.length === 0) {
        return null; // No available technicians
      }

      // Sort by workload (ascending) - least busy first
      const sortedTechnicians = [...technicians].sort((a, b) => {
        if (a.workload_count !== b.workload_count) {
          return a.workload_count - b.workload_count;
        }
        // Secondary sort by appointments today
        return a.appointments_today_count - b.appointments_today_count;
      });

      return sortedTechnicians[0];
    } catch (error) {
      throw new Error(`Failed to find best technician: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Auto-assign technician to appointment
   */
  autoAssignTechnician: async (appointmentId: number): Promise<AssignmentResponse> => {
    try {
      const bestTechnician = await technicianMngtService.findBestTechnician(appointmentId);
      
      if (!bestTechnician) {
        throw new Error('No available technicians found for auto-assignment');
      }

      return await technicianMngtService.assignTechnician(appointmentId, bestTechnician.id);
    } catch (error) {
      throw new Error(`Failed to auto-assign technician: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get technician statistics
   */
  getTechnicianStats: async (): Promise<{
    total: number;
    available: number;
    busy: number;
    averageWorkload: number;
    utilizationRate: number;
  }> => {
    try {
      const technicians = await technicianMngtService.getTechnicians();
      
      const total = technicians.length;
      const available = technicians.filter(tech => tech.is_available).length;
      const busy = total - available;
      const totalWorkload = technicians.reduce((sum, tech) => sum + tech.workload_count, 0);
      const averageWorkload = total > 0 ? totalWorkload / total : 0;
      const utilizationRate = total > 0 ? (busy / total) * 100 : 0;

      return {
        total,
        available,
        busy,
        averageWorkload,
        utilizationRate
      };
    } catch (error) {
      throw new Error(`Failed to get technician stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Cache management utilities
   */
  cache: {
    clear: () => cacheManager.invalidate(),
    invalidate: (key: keyof TechnicianCache) => cacheManager.invalidate(key),
    refresh: async () => {
      cacheManager.invalidate();
      await Promise.all([
        technicianMngtService.getTechnicians({}, true),
        technicianMngtService.getWorkloadOverview(true)
      ]);
    }
  }
};

// Export default service
export default technicianMngtService;