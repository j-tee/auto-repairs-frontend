import { toast } from "react-toastify";
import type { Employee } from "../types/employees";
import type { TechnicianWorkload, TechnicianWorkloadResponse } from "../types/appointments";
import { apiGet } from "../utils/api";

// Technician Workload Management Service
export const technicianWorkloadService = {
  // Get all technician workloads
  getTechnicianWorkload: async (): Promise<TechnicianWorkloadResponse> => {
    try {
      const response = await apiGet<TechnicianWorkloadResponse>("/shop/technicians/workload/");
      return response;
    } catch (error: unknown) {
      toast.error(
        "Error fetching technician workload: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get only available technicians (employees with technician role)
  getAvailableTechnicians: async (): Promise<Employee[]> => {
    try {
      const response = await apiGet<Employee[]>("/shop/technicians/available/");
      return response;
    } catch (error: unknown) {
      toast.error(
        "Error fetching available technicians: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get specific technician workload
  getTechnicianById: async (technicianId: string): Promise<TechnicianWorkload> => {
    try {
      const workloadData = await technicianWorkloadService.getTechnicianWorkload();
      const technician = workloadData.technicians.find(
        (tech) => tech.technician.id === technicianId
      );
      
      if (!technician) {
        throw new Error(`Technician with ID ${technicianId} not found`);
      }
      
      return technician;
    } catch (error: unknown) {
      toast.error(
        "Error fetching technician: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Helper function to check if an employee is a technician
  isTechnician: (employee: Employee): boolean => {
    const technicianRoles = ['technician', 'mechanic', 'tech'];
    return technicianRoles.some(role => 
      employee.position?.toLowerCase().includes(role) ||
      employee.department?.toLowerCase().includes(role)
    );
  },

  // Helper function to get technician availability status
  getTechnicianStatus: (workload: TechnicianWorkload): string => {
    if (workload.workload.is_available) {
      return 'Available';
    } else if (workload.workload.current_appointments >= workload.workload.max_capacity) {
      return 'At Capacity';
    } else {
      return 'Busy';
    }
  },

  // Helper function to calculate utilization rate
  calculateUtilizationRate: (current: number, max: number): string => {
    if (max === 0) return '0%';
    return `${Math.round((current / max) * 100)}%`;
  },
};

// Export types
export type { TechnicianWorkload, TechnicianWorkloadResponse };
