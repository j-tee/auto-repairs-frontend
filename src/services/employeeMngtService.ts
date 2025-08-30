import type {
  CreateEmployeeData,
  Department,
  Employee,
  EmployeeAvailability,
  EmployeeListResponse,
  EmployeePerformance,
  EmployeePerformanceResponse,
  EmployeeQuery,
  EmployeeStats,
  EmployeeStatsResponse,
  Position,
  UpdateEmployeeData,
  WorkSchedule,
} from "../types/employees";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";

// Employee Management Service
export const employeeMngtService = {
  // Get all employees with filtering and pagination
  getEmployees: async (
    query: EmployeeQuery = {}
  ): Promise<EmployeeListResponse> => {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.department) params.append("department", query.department);
    if (query.position) params.append("position", query.position);
    if (query.status) params.append("status", query.status);
    if (query.specialty) params.append("specialty", query.specialty);
    if (query.isActive !== undefined)
      params.append("is_active", query.isActive.toString());
    if (query.sortBy) params.append("sort_by", query.sortBy);
    if (query.sortOrder) params.append("sort_order", query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/shop/employees/${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<EmployeeListResponse>(endpoint);

    return {
      employees:
        response.results?.map((employee: Employee) => ({
          id: employee.id?.toString() || "",
          first_name: employee.first_name || "",
          last_name: employee.last_name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          position: employee.position || "",
          department: employee.department || "",
          employee_id: employee.employee_id || "",
          hireDate: employee.hire_date || "",
          status: employee.status || "active",
          hourly_rate: employee.hourly_rate,
          salary: employee.salary,
          specialties: employee.specialties || [],
          certifications: employee.certifications || [],
          skills: employee.skills || [],
          address: employee.address,
          emergency_contact: employee.emergency_contact
            ? {
                name: employee.emergency_contact.name || "",
                phone: employee.emergency_contact.phone || "",
                relationship: employee.emergency_contact.relationship || "",
              }
            : undefined,
          work_schedule: employee.work_schedule,
          notes: employee.notes,
          avatar: employee.avatar,
          is_active: employee.is_active ?? true,
          created_at: employee.created_at || new Date().toISOString(),
          updated_at: employee.updated_at || new Date().toISOString(),
          performance: employee.performance
            ? {
                rating: employee.performance.rating || 0,
                completed_jobs: employee.performance.completed_jobs || 0,
                average_job_time: employee.performance.average_job_time || 0,
                customer_rating: employee.performance.customer_rating || 0,
                last_review_date: employee.performance.last_review_date,
              }
            : undefined,
        })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10)),
    };
  },

  // Get employee by ID
  getEmployeeById: async (employeeId: string): Promise<Employee> => {
    const response = await apiGet<Employee>(`/shop/employees/${employeeId}/`);

    return {
      id: response.id?.toString() || "",
      first_name: response.first_name || "",
      last_name: response.last_name || "",
      email: response.email || "",
      phone: response.phone || "",
      position: response.position || "",
      department: response.department || "",
      employee_id: response.employee_id || "",
      hire_date: response.hire_date || "",
      status: response.status || "active",
      hourly_rate: response.hourly_rate,
      salary: response.salary,
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      skills: response.skills || [],
      address: response.address,
      emergency_contact: response.emergency_contact
        ? {
            name: response.emergency_contact.name || "",
            phone: response.emergency_contact.phone || "",
            relationship: response.emergency_contact.relationship || "",
          }
        : undefined,
      work_schedule: response.work_schedule,
      notes: response.notes,
      avatar: response.avatar,
      is_active: response.is_active ?? true,
      created_at: response.created_at || new Date().toISOString(),
      updated_at: response.updated_at || new Date().toISOString(),
      performance: response.performance
        ? {
            rating: response.performance.rating || 0,
            completed_jobs: response.performance.completed_jobs || 0,
            average_job_time: response.performance.average_job_time || 0,
            customer_rating: response.performance.customer_rating || 0,
            last_review_date: response.performance.last_review_date,
          }
        : undefined,
    };
  },

  // Create new employee
  createEmployee: async (
    employeeData: CreateEmployeeData
  ): Promise<Employee> => {
    const createData = {
      first_name: employeeData.firstName,
      last_name: employeeData.lastName,
      email: employeeData.email,
      phone: employeeData.phone,
      position: employeeData.position,
      department: employeeData.department,
      employee_id: employeeData.employeeId,
      hire_date: employeeData.hireDate,
      hourly_rate: employeeData.hourlyRate,
      salary: employeeData.salary,
      specialties: employeeData.specialties || [],
      certifications: employeeData.certifications || [],
      skills: employeeData.skills || [],
      address: employeeData.address,
      emergency_contact: employeeData.emergencyContact,
      work_schedule: employeeData.workSchedule,
      notes: employeeData.notes,
    };

    const response = await apiPost<Employee>("/shop/employees/", createData);

    return {
      id: response.id?.toString() || "",
      first_name: response.first_name || "",
      last_name: response.last_name || "",
      email: response.email || "",
      phone: response.phone || "",
      position: response.position || "",
      department: response.department || "",
      employee_id: response.employee_id || "",
      hire_date: response.hire_date || "",
      status: response.status || "active",
      hourly_rate: response.hourly_rate,
      salary: response.salary,
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      skills: response.skills || [],
      address: response.address,
      emergency_contact: response.emergency_contact
        ? {
            name: response.emergency_contact.name || "",
            phone: response.emergency_contact.phone || "",
            relationship: response.emergency_contact.relationship || "",
          }
        : undefined,
      work_schedule: response.work_schedule,
      notes: response.notes,
      avatar: response.avatar,
      is_active: response.is_active ?? true,
      created_at: response.created_at || new Date().toISOString(),
      updated_at: response.updated_at || new Date().toISOString(),
      performance: response.performance
        ? {
            rating: response.performance.rating || 0,
            completed_jobs: response.performance.completed_jobs || 0,
            average_job_time: response.performance.average_job_time || 0,
            customer_rating: response.performance.customer_rating || 0,
            last_review_date: response.performance.last_review_date,
          }
        : undefined,
    };
  },

  // Update employee
  updateEmployee: async (
    employeeId: string,
    employeeData: UpdateEmployeeData
  ): Promise<Employee> => {
    const updateData = {
      first_name: employeeData.firstName,
      last_name: employeeData.lastName,
      email: employeeData.email,
      phone: employeeData.phone,
      position: employeeData.position,
      department: employeeData.department,
      status: employeeData.status,
      hourly_rate: employeeData.hourlyRate,
      salary: employeeData.salary,
      specialties: employeeData.specialties,
      certifications: employeeData.certifications,
      skills: employeeData.skills,
      address: employeeData.address,
      emergency_contact: employeeData.emergencyContact,
      work_schedule: employeeData.workSchedule,
      notes: employeeData.notes,
      avatar: employeeData.avatar,
      is_active: employeeData.isActive,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const response = await apiPut<Employee>(
      `/shop/employees/${employeeId}/`,
      updateData
    );

    return {
      id: response.id?.toString() || "",
      first_name: response.first_name || "",
      last_name: response.last_name || "",
      email: response.email || "",
      phone: response.phone || "",
      position: response.position || "",
      department: response.department || "",
      employee_id: response.employee_id || "",
      hire_date: response.hire_date || "",
      status: response.status || "active",
      hourly_rate: response.hourly_rate,
      salary: response.salary,
      specialties: response.specialties || [],
      certifications: response.certifications || [],
      skills: response.skills || [],
      address: response.address,
      emergency_contact: response.emergency_contact
        ? {
            name: response.emergency_contact.name || "",
            phone: response.emergency_contact.phone || "",
            relationship: response.emergency_contact.relationship || "",
          }
        : undefined,
      work_schedule: response.work_schedule,
      notes: response.notes,
      avatar: response.avatar,
      is_active: response.is_active ?? true,
      created_at: response.created_at || new Date().toISOString(),
      updated_at: response.updated_at || new Date().toISOString(),
      performance: response.performance
        ? {
            rating: response.performance.rating || 0,
            completed_jobs: response.performance.completed_jobs || 0,
            average_job_time: response.performance.average_job_time || 0,
            customer_rating: response.performance.customer_rating || 0,
            last_review_date: response.performance.last_review_date,
          }
        : undefined,
    };
  },

  // Delete employee
  deleteEmployee: async (employeeId: string): Promise<void> => {
    await apiDelete(`/shop/employees/${employeeId}/`);
  },

  // Deactivate employee
  deactivateEmployee: async (employeeId: string): Promise<Employee> => {
    return await employeeMngtService.updateEmployee(employeeId, {
      isActive: false,
      status: "inactive",
    });
  },

  // Activate employee
  activateEmployee: async (employeeId: string): Promise<Employee> => {
    return await employeeMngtService.updateEmployee(employeeId, {
      isActive: true,
      status: "active",
    });
  },

  // Get employees by department
  getEmployeesByDepartment: async (department: string): Promise<Employee[]> => {
    const query: EmployeeQuery = {
      department,
      isActive: true,
      sortBy: "first_name",
      sortOrder: "asc",
    };

    const response = await employeeMngtService.getEmployees(query);
    return response.employees;
  },

  // Get technicians (employees with technical positions)
  getTechnicians: async (): Promise<Employee[]> => {
    const query: EmployeeQuery = {
      department: "Service",
      isActive: true,
      sortBy: "first_name",
      sortOrder: "asc",
    };

    const response = await employeeMngtService.getEmployees(query);
    return response.employees.filter(
      (emp) =>
        emp.position.toLowerCase().includes("technician") ||
        emp.position.toLowerCase().includes("mechanic")
    );
  },

  // Get employee statistics
  getEmployeeStats: async (): Promise<EmployeeStats> => {
    const response = await apiGet<EmployeeStatsResponse>(
      "/shop/employees/stats/"
    );

    return {
      totalEmployees: response.total_employees || 0,
      activeEmployees: response.active_employees || 0,
      employeesByDepartment:
        response.employees_by_department?.map((item: Department) => ({
          name: item.name || "",
          count: item.count || 0,
        })) || [],
      employeesByPosition:
        response.employees_by_position?.map((item: Position) => ({
          name: item.name || "",
          count: item.count || 0,
        })) || [],
      averageRating: response.average_rating || 0,
      totalJobsCompleted: response.total_jobs_completed || 0,
      averageHourlyRate: response.average_hourly_rate || 0,
      recentHires:
        response.recent_hires?.map((employee: Employee) => ({
          id: employee.id?.toString() || "",
          first_name: employee.first_name || "",
          last_name: employee.last_name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          position: employee.position || "",
          department: employee.department || "",
          employee_id: employee.employee_id || "",
          hireDate: employee.hire_date || "",
          status: employee.status || "active",
          hourly_rate: employee.hourly_rate,
          salary: employee.salary,
          specialties: employee.specialties || [],
          certifications: employee.certifications || [],
          skills: employee.skills || [],
          address: employee.address,
          emergency_contact: employee.emergency_contact
            ? {
                name: employee.emergency_contact.name || "",
                phone: employee.emergency_contact.phone || "",
                relationship: employee.emergency_contact.relationship || "",
              }
            : undefined,
          work_schedule: employee.work_schedule,
          notes: employee.notes,
          avatar: employee.avatar,
          is_active: employee.is_active ?? true,
          created_at: employee.created_at || new Date().toISOString(),
          updated_at: employee.updated_at || new Date().toISOString(),
          performance: employee.performance
            ? {
                rating: employee.performance.rating || 0,
                completed_jobs: employee.performance.completed_jobs || 0,
                average_job_time: employee.performance.average_job_time || 0,
                customer_rating: employee.performance.customer_rating || 0,
                last_review_date: employee.performance.last_review_date,
              }
            : undefined,
        })) || [],
    };
  },

  // Get employee performance
  getEmployeePerformance: async (
    employeeId: string,
    period: string = "month"
  ): Promise<EmployeePerformance> => {
    const response = await apiGet<EmployeePerformanceResponse>(
      `/shop/employees/${employeeId}/performance/?period=${period}`
    );

    return {
      employeeId,
      period,
      completedJobs: response.completed_jobs || 0,
      averageJobTime: response.average_job_time || 0,
      customerRating: response.customer_rating || 0,
      revenue: response.revenue || 0,
      efficiency: response.efficiency || 0,
      qualityScore: response.quality_score || 0,
      attendanceRate: response.attendance_rate || 0,
    };
  },

  // Search employees
  searchEmployees: async (
    searchTerm: string,
    options: { limit?: number; department?: string; position?: string } = {}
  ): Promise<Employee[]> => {
    const query: EmployeeQuery = {
      search: searchTerm,
      limit: options.limit || 10,
      isActive: true,
    };

    if (options.department) {
      query.department = options.department;
    }

    if (options.position) {
      query.position = options.position;
    }

    const response = await employeeMngtService.getEmployees(query);
    return response.employees;
  },

  // Get employee schedule
  getEmployeeSchedule: async (
    employeeId: string,
    date?: string
  ): Promise<WorkSchedule> => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const queryString = params.toString();
    const endpoint = `/shop/employees/${employeeId}/schedule/${
      queryString ? `?${queryString}` : ""
    }`;

    return await apiGet<WorkSchedule>(endpoint);
  },

  // Update employee schedule
  updateEmployeeSchedule: async (
    employeeId: string,
    schedule: Employee["work_schedule"]
  ): Promise<Employee> => {
    return await employeeMngtService.updateEmployee(employeeId, {
      workSchedule: schedule,
    });
  },

  // Get available technicians for appointment
  getAvailableTechnicians: async (
    date: string,
    time: string,
    serviceType?: string
  ): Promise<Employee[]> => {
    const params = new URLSearchParams();
    params.append("date", date);
    params.append("time", time);
    if (serviceType) params.append("service_type", serviceType);

    const response = await apiGet<EmployeeAvailability>(
      `/shop/employees/available-technicians/?${params.toString()}`
    );

    return (
      response.technicians?.map((employee: Employee) => ({
        id: employee.id?.toString() || "",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "",
        employee_id: employee.employee_id || "",
        hireDate: employee.hire_date || "",
        status: employee.status || "active",
        hourly_rate: employee.hourly_rate,
        salary: employee.salary,
        specialties: employee.specialties || [],
        certifications: employee.certifications || [],
        skills: employee.skills || [],
        address: employee.address,
        emergency_contact: employee.emergency_contact
          ? {
              name: employee.emergency_contact.name || "",
              phone: employee.emergency_contact.phone || "",
              relationship: employee.emergency_contact.relationship || "",
            }
          : undefined,
        work_schedule: employee.work_schedule,
        notes: employee.notes,
        avatar: employee.avatar,
        is_active: employee.is_active ?? true,
        created_at: employee.created_at || new Date().toISOString(),
        updated_at: employee.updated_at || new Date().toISOString(),
        performance: employee.performance
          ? {
              rating: employee.performance.rating || 0,
              completed_jobs: employee.performance.completed_jobs || 0,
              average_job_time: employee.performance.average_job_time || 0,
              customer_rating: employee.performance.customer_rating || 0,
              last_review_date: employee.performance.last_review_date,
            }
          : undefined,
      })) || []
    );
  },
};
