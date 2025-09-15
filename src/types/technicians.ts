// Technician Management Types
// Based on verified backend API responses

export interface CurrentJob {
  appointment_id: number;
  vehicle: string;
  customer: string;
  status: 'assigned' | 'in_progress' | 'completed';
  date: string;
  assigned_at: string;
  started_at?: string;
}

export interface Technician {
  id: number;
  name: string;
  role: 'technician' | 'manager' | 'owner';
  phone_number: string;
  email: string;
  picture?: string;
  shop: number;
  user?: number;
  workload_count: number;
  is_available: boolean;
  appointments_today_count: number;
  is_technician: boolean;
  current_jobs: CurrentJob[];
}

export interface TechnicianWorkload {
  technician: {
    id: number;
    name: string;
    role: string;
    shop: string;
  };
  workload: {
    current_appointments: number;
    is_available: boolean;
    appointments_today: number;
    max_capacity: number;
  };
  current_jobs: CurrentJob[];
}

export interface WorkloadSummary {
  total_technicians: number;
  available_technicians: number;
  busy_technicians: number;
}

export interface WorkloadOverview {
  summary: WorkloadSummary;
  technicians: TechnicianWorkload[];
}

export interface AssignmentRequest {
  technician_id: number;
}

export interface AssignmentResponse {
  id: number;
  assigned_technician: Technician;
  assigned_at: string;
  status: string;
}

// API Response types
export type TechniciansResponse = Technician[];
export type WorkloadResponse = WorkloadOverview;
export type AssignmentApiResponse = AssignmentResponse;

// Component Props Interfaces
export interface TechnicianCardProps {
  technician: Technician;
  onAssign?: (technicianId: number) => void;
  isSelectable?: boolean;
  showActions?: boolean;
  showWorkload?: boolean;
}

export interface WorkloadDashboardProps {
  onAssign?: (technicianId: number) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface AssignmentModalProps {
  isOpen: boolean;
  appointment: any; // Will use Appointment type from appointments.ts
  technicians: Technician[];
  onAssign: (technicianId: number) => Promise<void>;
  onClose: () => void;
}

// Query and Filter interfaces
export interface TechnicianQuery {
  role?: 'technician';
  is_available?: boolean;
  workload_count__lte?: number;
  shop?: number;
}

export interface TechnicianFilters {
  availability?: 'all' | 'available' | 'busy';
  maxWorkload?: number;
  shop?: number;
}

// Stats and Analytics
export interface TechnicianStats {
  total: number;
  available: number;
  busy: number;
  averageWorkload: number;
  utilizationRate: number;
}

// Service Response interfaces
export interface TechnicianServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Cache interfaces for performance
export interface TechnicianCacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface TechnicianCache {
  technicians?: TechnicianCacheEntry<Technician[]>;
  workload?: TechnicianCacheEntry<WorkloadOverview>;
}