

// Employee types
export interface EmployeeResponse {
    id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employee_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  hourly_rate?: number;
  salary?: number;
  specialties: string[];
  certifications: string[];
  skills: string[];
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  work_schedule?: WorkSchedule;
  notes?: string;
  avatar?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  performance?: {
    rating: number;
    completed_jobs: number;
    average_job_time: number;
    customer_rating: number;
    last_review_date?: string;
  };
  role?: 'manager' | 'technician' | 'service_advisor' | 'admin';
}
export interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employee_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'terminated';
  hourly_rate?: number;
  salary?: number;
  specialties: string[];
  certifications: string[];
  skills: string[];
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  work_schedule?: WorkSchedule;
  notes?: string;
  avatar?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  performance?: {
    rating: number;
    completed_jobs: number;
    average_job_time: number;
    customer_rating: number;
    last_review_date?: string;
  };
  role?: 'manager' | 'technician' | 'service_advisor' | 'admin';
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  hireDate: string;
  hourlyRate?: number;
  salary?: number;
  specialties?: string[];
  certifications?: string[];
  skills?: string[];
  address?: string;
  emergencyContact?: Employee['emergency_contact'];
  workSchedule?: Employee['work_schedule'];
  notes?: string;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  status?: Employee['status'];
  hourlyRate?: number;
  salary?: number;
  specialties?: string[];
  certifications?: string[];
  skills?: string[];
  address?: string;
  emergencyContact?: Employee['emergency_contact'];
  workSchedule?: Employee['work_schedule'];
  notes?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  position?: string;
  status?: Employee['status'];
  specialty?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
    results?: Employee[];
    count?: number;
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Department{
    name: string;
    count: number;
}
export interface Position{
    name: string;
    count: number;
}
export interface EmployeeStatsResponse {
    total_employees: number;
    active_employees: number;
    employees_by_department: Department[];
    employees_by_position: Position[];
    average_rating: number;
    total_jobs_completed: number;
    average_hourly_rate: number;
    recent_hires: Employee[];
}
export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  employeesByDepartment: Department[];
  employeesByPosition: Position[];
  averageRating: number;
  totalJobsCompleted: number;
  averageHourlyRate: number;
  recentHires: Employee[];
}
export interface EmployeePerformanceResponse {
   completed_jobs: number;
   average_job_time: number;
   customer_rating: number;
   last_review_date?: string;
   revenue?: number;
   efficiency?: number;
    quality_score?: number;
    attendance_rate?: number;
}
export interface EmployeePerformance {
  employeeId: string;
  period: string;
  completedJobs: number;
  averageJobTime: number;
  customerRating: number;
  revenue: number;
  efficiency: number;
  qualityScore: number;
  attendanceRate: number;
}

export interface WorkSchedule {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    wednesday: { start: string; end: string; };
    thursday: { start: string; end: string; };
    friday: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
}

export interface EmployeeAvailability {
    technicians: Employee[];
}
export interface EmployeeFilters {
  role?: Employee['role'] | Employee['role'][];
  department?: string;
  isActive?: boolean;
  shopId?: string;
}
