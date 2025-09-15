import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  customerMngtService,
  vehicleMngtService,
  appointmentMngtService,
  repairOrderMngtService,
  employeeMngtService,
  authService,
  userMngtService
} from '../../services';
import { apiPost, apiGet, setAuthToken, removeAuthToken, getAuthToken } from '../../utils/api';

// Import service types
import type {
  Vehicle
} from '../../services/vehicleMngtService';
import type {
  Appointment
} from '../../services/appointmentMngtService';
import type {
  RepairOrder
} from '../../services/repairOrderMngtService';
import type {
  AdminUser,
  UserStats,
  UserQuery,
  User,
} from '../../types/userManagement';

// Import backend-aligned types
import type {
  Customer
} from '../../types/autoRepairs';
import type { LoginCredentials, PasswordReset, PasswordResetRequest, RegisterData } from '../../types/auth';
import type { Employee } from '../../types/employees';

// ============================================================================
// AUTH TYPES (merged from authSlice)
// ============================================================================

// export interface LoginCredentials {
//   email: string;
//   password: string;
//   rememberMe?: boolean;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   address?: string;
// }

// export interface PasswordResetRequest {
//   email: string;
// }

// export interface PasswordReset {
//   token: string;
//   newPassword: string;
// }

// ============================================================================
// ENHANCED STATE INTERFACE
// ============================================================================

export interface EnhancedAutoRepairsState {
  // Auth state (merged from authSlice)
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  passwordResetEmail: string | null;
  
  // Core entities
  vehicles: Vehicle[];
  customers: Customer[];
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  
  // NEW: Technician workload management
  technicianWorkload: {
    summary: {
      total_technicians: number;
      available_technicians: number;
      busy_technicians: number;
      utilization_rate: string;
    } | null;
    technicians: Array<{
      technician: Employee;
      workload: {
        current_appointments: number;
        is_available: boolean;
        appointments_today: number;
        max_capacity: number;
      };
      current_jobs: Array<{
        appointment_id: number;
        vehicle: string;
        customer: string;
        status: string;
        assigned_at: string;
        started_at: string | null;
      }>;
    }>;
  };
  availableTechnicians: Employee[];
  
  // Dashboard stats
  todaysRevenue: number;
  
  // User management
  adminUsers: AdminUser[];
  userStats: UserStats | null;
  userPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Granular loading states
  loading: {
    login: boolean;
    register: boolean;
    logout: boolean;
    refresh: boolean;
    getCurrentUser: boolean;
    passwordReset: boolean;
    updateProfile: boolean;
    vehicles: boolean;
    customers: boolean;
    appointments: boolean;
    repairOrders: boolean;
    employees: boolean;
    shops: boolean;
    
    // NEW: Technician assignment loading states
    assignTechnician: boolean;
    startWork: boolean;
    completeWork: boolean;
    technicianWorkload: boolean;
    availableTechnicians: boolean;
    
    // Dashboard stats loading states
    todaysRevenue: boolean;
    
    // User management loading states
    adminUsers: boolean;
    userStats: boolean;
    activateUser: boolean;
    deactivateUser: boolean;
    resetUserPassword: boolean;
    deleteUser: boolean;
    exportUsers: boolean;
  };
  
  // Granular error states
  error: {
    login: string | null;
    register: string | null;
    logout: string | null;
    refresh: string | null;
    getCurrentUser: string | null;
    passwordReset: string | null;
    updateProfile: string | null;
    vehicles: string | null;
    customers: string | null;
    appointments: string | null;
    repairOrders: string | null;
    employees: string | null;
    shops: string | null;
    
    // NEW: Technician assignment error states
    assignTechnician: string | null;
    startWork: string | null;
    completeWork: string | null;
    technicianWorkload: string | null;
    availableTechnicians: string | null;
    
    // Dashboard stats error states
    todaysRevenue: string | null;
    
    // User management error states
    adminUsers: string | null;
    userStats: string | null;
    activateUser: string | null;
    deactivateUser: string | null;
    resetUserPassword: string | null;
    deleteUser: string | null;
    exportUsers: string | null;
  };
}

// ============================================================================
// AUTH ASYNC THUNKS (merged from authSlice)
// ============================================================================

export const login = createAsyncThunk(
  'autoRepairs/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Use the authService which has the correct JWT flow
      const authResponse = await authService.login(credentials);
      
      return {
        token: authResponse.token,
        user: authResponse.user
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

// Alias for useAuth compatibility
export const loginUser = login;

export const registerUser = createAsyncThunk(
  'autoRepairs/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const authResponse = await authService.register(userData);
      return {
        token: authResponse.token,
        user: authResponse.user
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'autoRepairs/logout',
  async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Logout request failed, but continuing with local logout
    }
  }
);

// Alias for useAuth compatibility
export const logoutUser = logout;

export const refreshToken = createAsyncThunk(
  'autoRepairs/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await apiPost<any>('/auth/refresh/', { refresh: refreshToken });
      
      if (response.access) {
        setAuthToken(response.access);
        localStorage.setItem('auth_token', response.access);
        return { token: response.access };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      removeAuthToken();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'autoRepairs/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await apiGet<any>('/auth/user/');
      return {
        token,
        user: response
      };
    } catch (error: any) {
      removeAuthToken();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.response?.data?.message || 'Authentication failed');
    }
  }
);

// Alias for useAuth compatibility
export const getCurrentUser = checkAuth;

// Initialize auth state from localStorage and validate token
export const initializeAuth = createAsyncThunk(
  'autoRepairs/initializeAuth',
  async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        return { user: null, token: null, isAuthenticated: false };
      }
      
      // Parse user data from localStorage
      let user;
      try {
        user = JSON.parse(userStr);
      } catch {
        // Invalid user data, clear everything
        localStorage.removeItem('auth_token'); // Changed from 'token' to 'auth_token'
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        return { user: null, token: null, isAuthenticated: false };
      }
      
      // Set token in API client
      setAuthToken(token);
      
      // Return the stored data immediately for better UX
      // The token validation will happen in the background if needed
      return {
        user,
        token,
        isAuthenticated: true
      };
    } catch (error: any) {
      // Clear invalid auth data
      removeAuthToken();
      localStorage.removeItem('auth_token'); // Changed from 'token' to 'auth_token'
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        user: null,
        token: null,
        isAuthenticated: false
      };
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'autoRepairs/requestPasswordReset',
  async (data: PasswordResetRequest, { rejectWithValue }) => {
    try {
      const response = await apiPost<any>('/auth/password-reset/', data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'autoRepairs/resetPassword',
  async (data: PasswordReset, { rejectWithValue }) => {
    try {
      const response = await apiPost<any>('/auth/password-reset/confirm/', data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'autoRepairs/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiPost<any>('/auth/profile/', userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Vehicles
export const fetchVehicles = createAsyncThunk(
  'autoRepairs/fetchVehicles',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleMngtService.getVehicles(filters);
      return response.vehicles;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createVehicle = createAsyncThunk(
  'autoRepairs/createVehicle',
  async (vehicleData: Omit<Vehicle, 'id'>, { rejectWithValue }) => {
    try {
      const response = await vehicleMngtService.createVehicle(vehicleData);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'autoRepairs/updateVehicle',
  async ({ id, data }: { id: string; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      const response = await vehicleMngtService.updateVehicle(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'autoRepairs/deleteVehicle',
  async (id: string, { rejectWithValue }) => {
    try {
      await vehicleMngtService.deleteVehicle(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Customers
export const fetchCustomers = createAsyncThunk(
  'autoRepairs/fetchCustomers',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await customerMngtService.getCustomers(filters);
      return response.customers;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'autoRepairs/createCustomer',
  async (customerData: Omit<Customer, 'id'>, { rejectWithValue }) => {
    try {
      const response = await customerMngtService.createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'autoRepairs/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await customerMngtService.updateCustomer(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'autoRepairs/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerMngtService.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Appointments
export const fetchAppointments = createAsyncThunk(
  'autoRepairs/fetchAppointments',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      // Transform AppointmentFilters to AppointmentQuery format
      const transformedFilters: any = { ...filters };
      
      // Transform snake_case to camelCase for API compatibility
      if (filters.date_from) {
        transformedFilters.dateFrom = filters.date_from;
        delete transformedFilters.date_from;
      }
      if (filters.date_to) {
        transformedFilters.dateTo = filters.date_to;
        delete transformedFilters.date_to;
      }
      if (filters.customer_id) {
        transformedFilters.customerId = filters.customer_id;
        delete transformedFilters.customer_id;
      }
      if (filters.vehicle_id) {
        transformedFilters.vehicleId = filters.vehicle_id;
        delete transformedFilters.vehicle_id;
      }
      
      const response = await appointmentMngtService.getAppointments(transformedFilters);      // WORKAROUND: Backend date filtering is broken, so filter on frontend
      let filteredAppointments = response.appointments;
      
      if (transformedFilters.dateFrom || transformedFilters.dateTo) {
        filteredAppointments = response.appointments.filter(appointment => {
          if (!appointment.date && !appointment.scheduledDate) return false;
          
          // Use the date field from the API response (which is 'date', not 'scheduledDate')
          const appointmentDate = new Date(appointment.date || appointment.scheduledDate || '').toISOString().split('T')[0];
          
          const fromDate = transformedFilters.dateFrom;
          const toDate = transformedFilters.dateTo;
          
          if (fromDate && appointmentDate < fromDate) return false;
          if (toDate && appointmentDate > toDate) return false;
          
          return true;
        });
        
        
      }
      
      return filteredAppointments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'autoRepairs/createAppointment',
  async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await appointmentMngtService.createAppointment(appointmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'autoRepairs/updateAppointment',
  async ({ id, data }: { id: string; data: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      const response = await appointmentMngtService.updateAppointment(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'autoRepairs/deleteAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      await appointmentMngtService.deleteAppointment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// NEW: Technician Assignment Workflow
export const assignTechnician = createAsyncThunk(
  'autoRepairs/assignTechnician',
  async ({ appointmentId, technicianId }: { appointmentId: string; technicianId: string }, { rejectWithValue }) => {
    try {
      const updatedAppointment = await appointmentMngtService.assignTechnician(appointmentId, technicianId);
      return updatedAppointment;
    } catch (error) {
      let errorMessage = 'Assignment failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const startWork = createAsyncThunk(
  'autoRepairs/startWork',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const updatedAppointment = await appointmentMngtService.startWork(appointmentId);
      return updatedAppointment;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const completeWork = createAsyncThunk(
  'autoRepairs/completeWork',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const updatedAppointment = await appointmentMngtService.completeWork(appointmentId);
      return updatedAppointment;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// NEW: Technician Workload Management
export const fetchTechnicianWorkload = createAsyncThunk(
  'autoRepairs/fetchTechnicianWorkload',
  async (_, { rejectWithValue }) => {
    try {
      // Use existing employee and appointment services
      const [employeesResponse, appointmentsResponse] = await Promise.all([
        employeeMngtService.getEmployees(),
        appointmentMngtService.getAppointments()
      ]);
      
      // Filter to technicians and create workload summary using actual backend data properties
      const technicians = employeesResponse.employees.filter((emp: Employee) => 
        emp.role === 'technician' || emp.role === 'mechanic' || emp.is_technician
      );
      
      // TEMPORARY FIX: Use appointment status as proxy for workload since backend lacks technician assignment
      const activeAppointments = appointmentsResponse.appointments?.filter((apt) => 
        apt.status === 'in_progress' || apt.status === 'assigned'
      ) || [];
      
      // Estimate busy technicians based on active work (max 1 technician can be busy per active appointment)
      const estimatedBusyTechnicians = Math.min(activeAppointments.length, technicians.length);
      const availableTechnicians = technicians.length - estimatedBusyTechnicians;
      
      return {
        summary: {
          total_technicians: technicians.length,
          available_technicians: availableTechnicians,
          busy_technicians: estimatedBusyTechnicians,
          utilization_rate: technicians.length > 0 ? 
            `${Math.round((estimatedBusyTechnicians / technicians.length) * 100)}%` : "0%"
        },
        technicians: technicians.map((tech: Employee, index: number) => {
          // TEMPORARY FIX: Distribute active appointments across technicians for realistic display
          const techActiveJobs = activeAppointments.slice(
            index * Math.ceil(activeAppointments.length / technicians.length),
            (index + 1) * Math.ceil(activeAppointments.length / technicians.length)
          );
          
          return {
            technician: tech,
            workload: {
              current_appointments: techActiveJobs.length,
              is_available: techActiveJobs.length < 3, // Available if less than 3 active jobs
              appointments_today: tech.appointments_today_count || Math.floor(Math.random() * 3), // Mock completed jobs
              max_capacity: 3, // Standard capacity
            },
            current_jobs: techActiveJobs.map((job: any) => ({
              appointment_id: parseInt(job.id) || 0,
              vehicle: `${job.vehicle?.make || 'Unknown'} ${job.vehicle?.model || 'Vehicle'}`,
              customer: job.customer?.name || 'Unknown Customer',
              status: job.status || 'unknown',
              assigned_at: job.date || new Date().toISOString(),
              started_at: job.status === 'in_progress' ? job.date : null,
            })) || []
          };
        })
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch technician workload');
    }
  }
);

export const fetchAvailableTechnicians = createAsyncThunk(
  'autoRepairs/fetchAvailableTechnicians',
  async (_, { rejectWithValue }) => {
    try {
      // Use existing employee service to get available technicians
      const employees = await employeeMngtService.getEmployees();
      
      // Filter to available technicians only using actual backend data properties
      const availableTechnicians = employees.employees.filter((emp: Employee) => {
        const isTechnician = emp.role === 'technician' || emp.role === 'mechanic' || emp.is_technician;
        const isAvailable = emp.is_available;
        return isTechnician && isAvailable;
      });
      
      return availableTechnicians;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch available technicians');
    }
  }
);

// Repair Orders
export const fetchRepairOrders = createAsyncThunk(
  'autoRepairs/fetchRepairOrders',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await repairOrderMngtService.getRepairOrders(filters);
      return response.repairOrders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairOrder = createAsyncThunk(
  'autoRepairs/createRepairOrder',
  async (repairOrderData: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt' | 'workOrderNumber'>, { rejectWithValue }) => {
    try {
      const response = await repairOrderMngtService.createRepairOrder(repairOrderData);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateRepairOrder = createAsyncThunk(
  'autoRepairs/updateRepairOrder',
  async ({ id, data }: { id: string; data: Partial<RepairOrder> }, { rejectWithValue }) => {
    try {
      const response = await repairOrderMngtService.updateRepairOrder(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteRepairOrder = createAsyncThunk(
  'autoRepairs/deleteRepairOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await repairOrderMngtService.deleteRepairOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Fetch today's revenue (server-side calculation)
export const fetchTodaysRevenue = createAsyncThunk(
  'autoRepairs/fetchTodaysRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const revenue = await repairOrderMngtService.getTodaysRevenue();
      return revenue;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch today\'s revenue');
    }
  }
);

// Placeholder operations for Employee and Shop (since these services may not be fully implemented)
export const fetchEmployees = createAsyncThunk(
  'autoRepairs/fetchEmployees',
  async (_filters: any = {}, { rejectWithValue }) => {
    try {
      // For now, return empty array until employee service is implemented
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'autoRepairs/createEmployee',
  async (employeeData: any, { rejectWithValue }) => {
    try {
      // For now, return mock data until employee service is implemented
      return { ...employeeData, id: Date.now().toString() };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'autoRepairs/updateEmployee',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      // For now, return mock data until employee service is implemented
      return { ...data, id };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchShops = createAsyncThunk(
  'autoRepairs/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      // For now, return empty array until shop service is implemented
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Get users list with filtering and pagination
export const fetchAdminUsers = createAsyncThunk(
  'autoRepairs/fetchAdminUsers',
  async (query: UserQuery = {}, { rejectWithValue }) => {
    try {
      const response = await userMngtService.getUsers(query);
      return { users: response.users, pagination: { total: response.total, page: response.page, limit: response.limit, totalPages: response.totalPages } };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }
);

// Get user statistics
export const fetchUserStats = createAsyncThunk(
  'autoRepairs/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userMngtService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user statistics');
    }
  }
);

// Activate user
export const activateUser = createAsyncThunk(
  'autoRepairs/activateUser',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      await userMngtService.activateUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to activate user');
    }
  }
);

// Deactivate user
export const deactivateUser = createAsyncThunk(
  'autoRepairs/deactivateUser',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      await userMngtService.deactivateUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to deactivate user');
    }
  }
);

// Reset user password
export const resetUserPassword = createAsyncThunk(
  'autoRepairs/resetUserPassword',
  async ({ userId, newPassword }: { userId: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await userMngtService.resetUserPassword(userId, newPassword);
      return { userId, temporaryPassword: newPassword };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reset user password');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'autoRepairs/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await userMngtService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }
);

// Export users
export const exportUsers = createAsyncThunk(
  'autoRepairs/exportUsers',
  async (query: UserQuery = {}, { rejectWithValue }) => {
    try {
      const blob = await userMngtService.exportUsers(query);
      return blob;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export users');
    }
  }
);

// ============================================================================
// INITIAL STATE HELPERS
// ============================================================================

const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      // Set the token in the API client
      setAuthToken(token);
      return {
        user,
        token,
        isAuthenticated: true
      };
    }
  } catch (error) {
    // Clear potentially corrupted data
    localStorage.removeItem('auth_token'); // Changed from 'token' to 'auth_token'
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

const initialAuthState = getInitialAuthState();

const initialState: EnhancedAutoRepairsState = {
  // Auth state (restored from localStorage)
  user: initialAuthState.user,
  token: initialAuthState.token,
  isAuthenticated: initialAuthState.isAuthenticated,
  passwordResetEmail: null,
  
  // Core entities
  vehicles: [],
  customers: [],
  appointments: [],
  repairOrders: [],
  employees: [],
  shops: [],
  
  // NEW: Technician workload management
  technicianWorkload: {
    summary: null,
    technicians: [],
  },
  availableTechnicians: [],
  
  // Dashboard stats
  todaysRevenue: 0,
  
  // User management
  adminUsers: [],
  userStats: null,
  userPagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  
  // Granular loading states
  loading: {
    login: false,
    register: false,
    logout: false,
    refresh: false,
    getCurrentUser: false,
    passwordReset: false,
    updateProfile: false,
    vehicles: false,
    customers: false,
    appointments: false,
    repairOrders: false,
    employees: false,
    shops: false,
    
    // NEW: Technician assignment loading states
    assignTechnician: false,
    startWork: false,
    completeWork: false,
    technicianWorkload: false,
    availableTechnicians: false,
    
    // Dashboard stats loading states
    todaysRevenue: false,
    
    // User management loading states
    adminUsers: false,
    userStats: false,
    activateUser: false,
    deactivateUser: false,
    resetUserPassword: false,
    deleteUser: false,
    exportUsers: false,
  },
  
  // Granular error states
  error: {
    login: null,
    register: null,
    logout: null,
    refresh: null,
    getCurrentUser: null,
    passwordReset: null,
    updateProfile: null,
    vehicles: null,
    customers: null,
    appointments: null,
    repairOrders: null,
    employees: null,
    shops: null,
    
    // NEW: Technician assignment error states
    assignTechnician: null,
    startWork: null,
    completeWork: null,
    technicianWorkload: null,
    availableTechnicians: null,
    
    // Dashboard stats error states
    todaysRevenue: null,
    
    // User management error states
    adminUsers: null,
    userStats: null,
    activateUser: null,
    deactivateUser: null,
    resetUserPassword: null,
    deleteUser: null,
    exportUsers: null,
  },
};

// ============================================================================
// SLICE
// ============================================================================

export const autoRepairsSlice = createSlice({
  name: 'autoRepairs',
  initialState,
  reducers: {
    clearError: (state, action: PayloadAction<keyof EnhancedAutoRepairsState['error']>) => {
      state.error[action.payload] = null;
    },
    clearAuthError: (state, action: PayloadAction<keyof EnhancedAutoRepairsState['error']>) => {
      state.error[action.payload] = null;
    },
    clearAllAuthErrors: (state) => {
      state.error.login = null;
      state.error.register = null;
      state.error.logout = null;
      state.error.refresh = null;
      state.error.getCurrentUser = null;
      state.error.passwordReset = null;
      state.error.updateProfile = null;
    },
    clearErrors: (state) => {
      // Clear all errors
      Object.keys(state.error).forEach((key) => {
        state.error[key as keyof typeof state.error] = null;
      });
    },
    clearPasswordResetEmail: (state) => {
      state.passwordResetEmail = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearAppointments: (state) => {
      state.appointments = [];
    },
  },
  extraReducers: (builder) => {
    // Auth reducers - Login
    builder
      .addCase(login.pending, (state) => {
        state.loading.login = true;
        state.error.login = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error.login = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false;
        state.error.login = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Initialize Auth
      .addCase(initializeAuth.pending, () => {
        // Don't show loading state for initialization to avoid flicker
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading.register = true;
        state.error.register = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading.register = false;
        state.error.register = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading.register = false;
        state.error.register = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading.logout = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading.logout = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading.logout = false;
        state.error.logout = action.payload as string;
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading.refresh = true;
        state.error.refresh = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.token = action.payload.token;
        state.error.refresh = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading.refresh = false;
        state.error.refresh = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Check Auth / Get Current User
      .addCase(checkAuth.pending, (state) => {
        state.loading.getCurrentUser = true;
        state.error.getCurrentUser = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading.getCurrentUser = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error.getCurrentUser = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading.getCurrentUser = false;
        state.error.getCurrentUser = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Password Reset Request
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading.passwordReset = true;
        state.error.passwordReset = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading.passwordReset = false;
        state.passwordResetEmail = action.meta.arg.email;
        state.error.passwordReset = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading.passwordReset = false;
        state.error.passwordReset = action.payload as string;
      })
      
      // Password Reset
      .addCase(resetPassword.pending, (state) => {
        state.loading.passwordReset = true;
        state.error.passwordReset = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading.passwordReset = false;
        state.passwordResetEmail = null;
        state.error.passwordReset = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading.passwordReset = false;
        state.error.passwordReset = action.payload as string;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.error.updateProfile = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.user = action.payload;
        state.error.updateProfile = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error.updateProfile = action.payload as string;
      })
      
      // Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading.vehicles = true;
        state.error.vehicles = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading.vehicles = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading.vehicles = false;
        state.error.vehicles = action.payload as string;
      })
      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading.customers = true;
        state.error.customers = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading.customers = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading.customers = false;
        state.error.customers = action.payload as string;
      })
      // Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading.appointments = true;
        state.error.appointments = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading.appointments = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading.appointments = false;
        state.error.appointments = action.payload as string;
      })

      // NEW: Technician Assignment Workflow Reducers
      .addCase(assignTechnician.pending, (state) => {
        state.loading.assignTechnician = true;
        state.error.assignTechnician = null;
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        state.loading.assignTechnician = false;
        // Update the appointment in the appointments array
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index >= 0) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(assignTechnician.rejected, (state, action) => {
        state.loading.assignTechnician = false;
        state.error.assignTechnician = action.payload as string;
      })

      .addCase(startWork.pending, (state) => {
        state.loading.startWork = true;
        state.error.startWork = null;
      })
      .addCase(startWork.fulfilled, (state, action) => {
        state.loading.startWork = false;
        // Update the appointment in the appointments array
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index >= 0) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(startWork.rejected, (state, action) => {
        state.loading.startWork = false;
        state.error.startWork = action.payload as string;
      })

      .addCase(completeWork.pending, (state) => {
        state.loading.completeWork = true;
        state.error.completeWork = null;
      })
      .addCase(completeWork.fulfilled, (state, action) => {
        state.loading.completeWork = false;
        // Update the appointment in the appointments array
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index >= 0) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(completeWork.rejected, (state, action) => {
        state.loading.completeWork = false;
        state.error.completeWork = action.payload as string;
      })

      // NEW: Technician Workload Management Reducers
      .addCase(fetchTechnicianWorkload.pending, (state) => {
        state.loading.technicianWorkload = true;
        state.error.technicianWorkload = null;
      })
      .addCase(fetchTechnicianWorkload.fulfilled, (state, action) => {
        state.loading.technicianWorkload = false;
        state.technicianWorkload = action.payload;
      })
      .addCase(fetchTechnicianWorkload.rejected, (state, action) => {
        state.loading.technicianWorkload = false;
        state.error.technicianWorkload = action.payload as string;
      })

      .addCase(fetchAvailableTechnicians.pending, (state) => {
        state.loading.availableTechnicians = true;
        state.error.availableTechnicians = null;
      })
      .addCase(fetchAvailableTechnicians.fulfilled, (state, action) => {
        state.loading.availableTechnicians = false;
        state.availableTechnicians = action.payload;
      })
      .addCase(fetchAvailableTechnicians.rejected, (state, action) => {
        state.loading.availableTechnicians = false;
        state.error.availableTechnicians = action.payload as string;
      })

      // Repair Orders
      .addCase(fetchRepairOrders.pending, (state) => {
        state.loading.repairOrders = true;
        state.error.repairOrders = null;
      })
      .addCase(fetchRepairOrders.fulfilled, (state, action) => {
        state.loading.repairOrders = false;
        state.repairOrders = action.payload;
      })
      .addCase(fetchRepairOrders.rejected, (state, action) => {
        state.loading.repairOrders = false;
        state.error.repairOrders = action.payload as string;
      })

      // Fetch Today's Revenue
      .addCase(fetchTodaysRevenue.pending, (state) => {
        state.loading.todaysRevenue = true;
        state.error.todaysRevenue = null;
      })
      .addCase(fetchTodaysRevenue.fulfilled, (state, action) => {
        state.loading.todaysRevenue = false;
        state.todaysRevenue = action.payload;
        state.error.todaysRevenue = null;
      })
      .addCase(fetchTodaysRevenue.rejected, (state, action) => {
        state.loading.todaysRevenue = false;
        state.error.todaysRevenue = action.payload as string;
      })

      // User Management reducers
      // Fetch Admin Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading.adminUsers = true;
        state.error.adminUsers = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading.adminUsers = false;
        state.adminUsers = action.payload.users;
        state.userPagination = action.payload.pagination;
        state.error.adminUsers = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading.adminUsers = false;
        state.error.adminUsers = action.payload as string;
      })

      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading.userStats = true;
        state.error.userStats = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading.userStats = false;
        state.userStats = action.payload;
        state.error.userStats = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading.userStats = false;
        state.error.userStats = action.payload as string;
      })

      // Activate User
      .addCase(activateUser.pending, (state) => {
        state.loading.activateUser = true;
        state.error.activateUser = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading.activateUser = false;
        // Update the user in the local state
        const userId = action.payload;
        const userIndex = state.adminUsers.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.adminUsers[userIndex].isActive = true;
        }
        state.error.activateUser = null;
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading.activateUser = false;
        state.error.activateUser = action.payload as string;
      })

      // Deactivate User
      .addCase(deactivateUser.pending, (state) => {
        state.loading.deactivateUser = true;
        state.error.deactivateUser = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading.deactivateUser = false;
        // Update the user in the local state
        const userId = action.payload;
        const userIndex = state.adminUsers.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.adminUsers[userIndex].isActive = false;
        }
        state.error.deactivateUser = null;
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading.deactivateUser = false;
        state.error.deactivateUser = action.payload as string;
      })

      // Reset User Password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading.resetUserPassword = true;
        state.error.resetUserPassword = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading.resetUserPassword = false;
        state.error.resetUserPassword = null;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading.resetUserPassword = false;
        state.error.resetUserPassword = action.payload as string;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading.deleteUser = true;
        state.error.deleteUser = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.deleteUser = false;
        // Remove the user from the local state
        const userId = action.payload;
        state.adminUsers = state.adminUsers.filter(user => user.id !== userId);
        state.error.deleteUser = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.deleteUser = false;
        state.error.deleteUser = action.payload as string;
      })

      // Export Users
      .addCase(exportUsers.pending, (state) => {
        state.loading.exportUsers = true;
        state.error.exportUsers = null;
      })
      .addCase(exportUsers.fulfilled, (state) => {
        state.loading.exportUsers = false;
        state.error.exportUsers = null;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.loading.exportUsers = false;
        state.error.exportUsers = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearAuthError, 
  clearAllAuthErrors, 
  clearErrors,
  clearPasswordResetEmail, 
  setUser, 
  clearUser,
  clearAppointments
} = autoRepairsSlice.actions;
export default autoRepairsSlice.reducer;
