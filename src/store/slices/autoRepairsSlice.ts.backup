import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  customerMngtService,
  vehicleMngtService,
  appointmentMngtService,
  repairOrderMngtService,
  employeeMngtService,
  shopMngtService
} from '../../services';
import { apiPost, apiGet, setAuthToken, removeAuthToken, getAuthToken } from '../../utils/api';

// Import service types instead of old autoRepairs types
import type {
  Vehicle,
  CreateVehicleData
} from '../../services/vehicleMngtService';
import type {
  Customer,
  CreateCustomerData
} from '../../services/customerMngtService';
import type {
  Appointment,
  CreateAppointmentData
} from '../../services/appointmentMngtService';
import type {
  RepairOrder,
  CreateRepairOrderData
} from '../../services/repairOrderMngtService';
import type {
  Employee,
  CreateEmployeeData
} from '../../services/employeeMngtService';
import type {
  Shop,
  CreateShopData
} from '../../services/shopMngtService';

// Simple filter types
interface AppointmentFilters {
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// AUTH TYPES (merged from authSlice)
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'employee' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: User['role'];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

// ============================================================================
// AUTH ASYNC THUNKS (merged from authSlice)
// ============================================================================

export const loginUser = createAsyncThunk(
  'autoRepairs/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };
      
      const response = await apiPost<{ access: string; refresh: string }>('/token/', loginData);
      
      const authResponse: AuthResponse = {
        token: response.access,
        refreshToken: response.refresh,
        user: {} as User,
        expiresIn: 3600
      };
      
      setAuthToken(authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      
      try {
        const userData = await apiGet<any>('/auth/user/');
        
        const user: User = {
          id: userData.id?.toString() || '',
          email: userData.email || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          role: userData.role || 'customer',
          avatar: userData.avatar,
          phone: userData.phone,
          address: userData.address,
          isActive: userData.is_active ?? true,
          createdAt: userData.date_joined || new Date().toISOString(),
          lastLogin: userData.last_login
        };
        
        authResponse.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (userError) {
        console.error('Failed to fetch user data:', userError);
        authResponse.user = {
          id: '',
          email: credentials.email,
          firstName: '',
          lastName: '',
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(authResponse.user));
      }
      
      return authResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'autoRepairs/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const registerData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer'
      };
      
      const registerResponse = await apiPost<User>('/auth/register/', registerData);
      
      const loginCredentials: LoginCredentials = {
        email: userData.email,
        password: userData.password
      };
      
      const loginData = {
        email: loginCredentials.email,
        password: loginCredentials.password
      };
      
      const tokenResponse = await apiPost<{ access: string; refresh: string }>('/token/', loginData);
      
      const authResponse: AuthResponse = {
        token: tokenResponse.access,
        refreshToken: tokenResponse.refresh,
        user: registerResponse,
        expiresIn: 3600
      };
      
      setAuthToken(authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      return authResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'autoRepairs/logoutUser',
  async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiPost('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      removeAuthToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return;
  }
);

export const refreshToken = createAsyncThunk(
  'autoRepairs/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiPost<{ access: string }>('/token/refresh/', { refresh: refreshToken });
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        throw new Error('No user data available');
      }
      
      const authResponse: AuthResponse = {
        token: response.access,
        refreshToken: refreshToken,
        user: user,
        expiresIn: 3600
      };
      
      setAuthToken(authResponse.token);
      
      return authResponse;
    } catch (error) {
      removeAuthToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'autoRepairs/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const userData = await apiGet<any>('/auth/user/');
      
      const user: User = {
        id: userData.id?.toString() || '',
        email: userData.email || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: userData.role || 'customer',
        avatar: userData.avatar,
        phone: userData.phone,
        address: userData.address,
        isActive: userData.is_active ?? true,
        createdAt: userData.date_joined || new Date().toISOString(),
        lastLogin: userData.last_login
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user info');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'autoRepairs/requestPasswordReset',
  async (data: PasswordResetRequest, { rejectWithValue }) => {
    try {
      await apiPost('/auth/password-reset/', data);
      return data.email;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'autoRepairs/resetPassword',
  async (data: PasswordReset, { rejectWithValue }) => {
    try {
      await apiPost('/auth/password-reset-confirm/', data);
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'autoRepairs/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const updatedUser = await apiPost<User>('/auth/profile/', userData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Vehicle Operations
// ============================================================================

export const fetchVehicles = createAsyncThunk(
  'autoRepairs/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleMngtService.getVehicles();
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
      return await vehicleMngtService.createVehicle(vehicleData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'autoRepairs/updateVehicle',
  async ({ id, data }: { id: string; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      return await vehicleMngtService.updateVehicle(id, data);
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

// ============================================================================
// ASYNC THUNKS - Customer Operations
// ============================================================================

export const fetchCustomers = createAsyncThunk(
  'autoRepairs/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerMngtService.getCustomers();
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
      return await customerMngtService.createCustomer(customerData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'autoRepairs/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      return await customerMngtService.updateCustomer(id, data);
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

// ============================================================================
// ASYNC THUNKS - Repair Job Operations (Legacy)
// ============================================================================

export const fetchRepairJobs = createAsyncThunk(
  'autoRepairs/fetchRepairJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await repairOrderMngtService.getRepairOrders();
      return response.repairOrders;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairJob = createAsyncThunk(
  'autoRepairs/createRepairJob',
  async (jobData: Omit<RepairOrder, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      return await repairOrderMngtService.createRepairOrder(jobData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateRepairJobStatus = createAsyncThunk(
  'autoRepairs/updateRepairJobStatus',
  async ({ id, status }: { id: string; status: RepairOrder['status'] }, { rejectWithValue }) => {
    try {
      return await repairOrderMngtService.updateRepairOrder(id, { status });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Appointment Operations
// ============================================================================

export const fetchAppointments = createAsyncThunk(
  'autoRepairs/fetchAppointments',
  async (filters: AppointmentFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await appointmentMngtService.getAppointments(filters || {});
      return response.appointments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchTodaysAppointments = createAsyncThunk(
  'autoRepairs/fetchTodaysAppointments',
  async (_, { rejectWithValue }) => {
    try {
      return await appointments.getToday();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'autoRepairs/createAppointment',
  async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await appointments.create(appointmentData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'autoRepairs/updateAppointment',
  async ({ id, data }: { id: string; data: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      return await appointments.update(id, data);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'autoRepairs/updateAppointmentStatus',
  async ({ id, status }: { id: string; status: Appointment['status'] }, { rejectWithValue }) => {
    try {
      return await appointments.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'autoRepairs/confirmAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      return await appointments.confirm(id);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'autoRepairs/cancelAppointment',
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await appointments.cancel(id, reason);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'autoRepairs/rescheduleAppointment',
  async ({ id, newDate, newTime }: { id: string; newDate: string; newTime: string }, { rejectWithValue }) => {
    try {
      return await appointments.reschedule(id, newDate, newTime);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'autoRepairs/deleteAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      await appointments.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Repair Order Operations
// ============================================================================

export const fetchRepairOrders = createAsyncThunk(
  'autoRepairs/fetchRepairOrders',
  async (filters: RepairOrderFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await repairOrders.getAll({}, filters || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchActiveRepairOrders = createAsyncThunk(
  'autoRepairs/fetchActiveRepairOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await repairOrders.getActive();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairOrder = createAsyncThunk(
  'autoRepairs/createRepairOrder',
  async (repairOrderData: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt' | 'workOrderNumber'>, { rejectWithValue }) => {
    try {
      return await repairOrders.create(repairOrderData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairOrderFromAppointment = createAsyncThunk(
  'autoRepairs/createRepairOrderFromAppointment',
  async ({ appointmentId, additionalData }: { appointmentId: string; additionalData?: Partial<RepairOrder> }, { rejectWithValue }) => {
    try {
      return await repairOrders.createFromAppointment(appointmentId, additionalData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateRepairOrder = createAsyncThunk(
  'autoRepairs/updateRepairOrder',
  async ({ id, data }: { id: string; data: Partial<RepairOrder> }, { rejectWithValue }) => {
    try {
      return await repairOrders.update(id, data);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateRepairOrderStatus = createAsyncThunk(
  'autoRepairs/updateRepairOrderStatus',
  async ({ id, status }: { id: string; status: RepairOrder['status'] }, { rejectWithValue }) => {
    try {
      return await repairOrders.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const assignTechnician = createAsyncThunk(
  'autoRepairs/assignTechnician',
  async ({ repairOrderId, technicianId }: { repairOrderId: string; technicianId: string }, { rejectWithValue }) => {
    try {
      return await repairOrders.assignTechnician(repairOrderId, technicianId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const completeRepairOrder = createAsyncThunk(
  'autoRepairs/completeRepairOrder',
  async ({ 
    id, 
    completionData 
  }: { 
    id: string; 
    completionData: {
      workPerformed: string;
      mileageOut?: number;
      internalNotes?: string;
      recommendedServices?: string;
    }
  }, { rejectWithValue }) => {
    try {
      return await repairOrders.complete(id, completionData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteRepairOrder = createAsyncThunk(
  'autoRepairs/deleteRepairOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await repairOrders.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Employee Operations
// ============================================================================

export const fetchEmployees = createAsyncThunk(
  'autoRepairs/fetchEmployees',
  async (filters: EmployeeFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await employees.getAll({}, filters || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchTechnicians = createAsyncThunk(
  'autoRepairs/fetchTechnicians',
  async (_, { rejectWithValue }) => {
    try {
      return await employees.getByRole('technician');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'autoRepairs/createEmployee',
  async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await employees.create(employeeData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'autoRepairs/updateEmployee',
  async ({ id, data }: { id: string; data: Partial<Employee> }, { rejectWithValue }) => {
    try {
      return await employees.update(id, data);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Shop Operations
// ============================================================================

export const fetchShops = createAsyncThunk(
  'autoRepairs/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      return await shops.getAll();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Service Categories
// ============================================================================

export const fetchServiceCategories = createAsyncThunk(
  'autoRepairs/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await serviceCategories.getActive();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// ASYNC THUNKS - Dashboard Data
// ============================================================================

export const fetchDashboardSummary = createAsyncThunk(
  'autoRepairs/fetchDashboardSummary',
  async (shopId: string | undefined, { rejectWithValue }) => {
    try {
      return await dashboard.getSummary(shopId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface EnhancedAutoRepairsState {
  // Auth state (merged from authSlice)
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  passwordResetEmail: string | null;

  // Core entities
  vehicles: Vehicle[];
  customers: Customer[];
  repairJobs: RepairJob[]; // Legacy support
  
  // New entities
  appointments: Appointment[];
  repairOrders: RepairOrder[];
  employees: Employee[];
  shops: Shop[];
  serviceCategories: ServiceCategory[];
  
  // Dashboard data
  dashboardSummary: DashboardSummary | null;
  todaysAppointments: Appointment[];
  activeRepairOrders: RepairOrder[];
  
  // Loading states
  loading: {
    // Auth loading states
    login: boolean;
    register: boolean;
    logout: boolean;
    refresh: boolean;
    getCurrentUser: boolean;
    passwordReset: boolean;
    updateProfile: boolean;

    // Entity loading states
    vehicles: boolean;
    customers: boolean;
    repairJobs: boolean;
    appointments: boolean;
    repairOrders: boolean;
    employees: boolean;
    shops: boolean;
    serviceCategories: boolean;
    dashboard: boolean;
    
    // Operation-specific loading
    createVehicle: boolean;
    updateVehicle: boolean;
    deleteVehicle: boolean;
    createCustomer: boolean;
    updateCustomer: boolean;
    deleteCustomer: boolean;
    createJob: boolean;
    updateJob: boolean;
    createAppointment: boolean;
    updateAppointment: boolean;
    deleteAppointment: boolean;
    createRepairOrder: boolean;
    updateRepairOrder: boolean;
    deleteRepairOrder: boolean;
    createEmployee: boolean;
    updateEmployee: boolean;
  };
  
  // Error states
  error: {
    // Auth error states
    login: string | null;
    register: string | null;
    logout: string | null;
    refresh: string | null;
    getCurrentUser: string | null;
    passwordReset: string | null;
    updateProfile: string | null;

    // Entity error states
    vehicles: string | null;
    customers: string | null;
    repairJobs: string | null;
    appointments: string | null;
    repairOrders: string | null;
    employees: string | null;
    shops: string | null;
    serviceCategories: string | null;
    dashboard: string | null;
    
    // Operation-specific errors
    createVehicle: string | null;
    updateVehicle: string | null;
    deleteVehicle: string | null;
    createCustomer: string | null;
    updateCustomer: string | null;
    deleteCustomer: string | null;
    createJob: string | null;
    updateJob: string | null;
    createAppointment: string | null;
    updateAppointment: string | null;
    deleteAppointment: string | null;
    createRepairOrder: string | null;
    updateRepairOrder: string | null;
    deleteRepairOrder: string | null;
    createEmployee: string | null;
    updateEmployee: string | null;
  };
  
  // Filters and selections
  selectedCustomerId: string | null;
  selectedVehicleId: string | null;
  selectedAppointmentId: string | null;
  selectedRepairOrderId: string | null;
  appointmentFilters: AppointmentFilters;
  repairOrderFilters: RepairOrderFilters;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialState = (): EnhancedAutoRepairsState => {
  const token = getAuthToken();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    // Auth state
    user,
    token,
    isAuthenticated: !!(token && user),
    passwordResetEmail: null,

    // Core entities
    vehicles: [],
    customers: [],
    repairJobs: [],
    
    // New entities
    appointments: [],
    repairOrders: [],
    employees: [],
    shops: [],
    serviceCategories: [],
    
    // Dashboard data
    dashboardSummary: null,
    todaysAppointments: [],
    activeRepairOrders: [],
    
    // Loading states
    loading: {
      // Auth loading states
      login: false,
      register: false,
      logout: false,
      refresh: false,
      getCurrentUser: false,
      passwordReset: false,
      updateProfile: false,

      // Entity loading states
      vehicles: false,
      customers: false,
      repairJobs: false,
      appointments: false,
      repairOrders: false,
      employees: false,
      shops: false,
      serviceCategories: false,
      dashboard: false,
      createVehicle: false,
      updateVehicle: false,
      deleteVehicle: false,
      createCustomer: false,
      updateCustomer: false,
      deleteCustomer: false,
      createJob: false,
      updateJob: false,
      createAppointment: false,
      updateAppointment: false,
      deleteAppointment: false,
      createRepairOrder: false,
      updateRepairOrder: false,
      deleteRepairOrder: false,
      createEmployee: false,
      updateEmployee: false,
    },
    
    // Error states
    error: {
      // Auth error states
      login: null,
      register: null,
      logout: null,
      refresh: null,
      getCurrentUser: null,
      passwordReset: null,
      updateProfile: null,

      // Entity error states
      vehicles: null,
      customers: null,
      repairJobs: null,
      appointments: null,
      repairOrders: null,
      employees: null,
      shops: null,
      serviceCategories: null,
      dashboard: null,
      createVehicle: null,
      updateVehicle: null,
      deleteVehicle: null,
      createCustomer: null,
      updateCustomer: null,
      deleteCustomer: null,
      createJob: null,
      updateJob: null,
      createAppointment: null,
      updateAppointment: null,
      deleteAppointment: null,
      createRepairOrder: null,
      updateRepairOrder: null,
      deleteRepairOrder: null,
      createEmployee: null,
      updateEmployee: null,
    },
    
    // Filters and selections
    selectedCustomerId: null,
    selectedVehicleId: null,
    selectedAppointmentId: null,
    selectedRepairOrderId: null,
    appointmentFilters: {},
    repairOrderFilters: {},
  };
};

const initialState = getInitialState();

// ============================================================================
// SLICE DEFINITION
// ============================================================================

const autoRepairsSlice = createSlice({
  name: 'autoRepairs',
  initialState,
  reducers: {
    // Clear all errors
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        (state.error as any)[key] = null;
      });
    },
    
    // Clear specific error
    clearError: (state, action: PayloadAction<keyof EnhancedAutoRepairsState['error']>) => {
      state.error[action.payload] = null;
    },

    // Auth-specific error clearing (merged from authSlice)
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
    clearPasswordResetEmail: (state) => {
      state.passwordResetEmail = null;
    },
    
    // Selection actions
    selectCustomer: (state, action: PayloadAction<string | null>) => {
      state.selectedCustomerId = action.payload;
    },
    
    selectVehicle: (state, action: PayloadAction<string | null>) => {
      state.selectedVehicleId = action.payload;
    },
    
    selectAppointment: (state, action: PayloadAction<string | null>) => {
      state.selectedAppointmentId = action.payload;
    },
    
    selectRepairOrder: (state, action: PayloadAction<string | null>) => {
      state.selectedRepairOrderId = action.payload;
    },
    
    // Filter actions
    setAppointmentFilters: (state, action: PayloadAction<AppointmentFilters>) => {
      state.appointmentFilters = action.payload;
    },
    
    setRepairOrderFilters: (state, action: PayloadAction<RepairOrderFilters>) => {
      state.repairOrderFilters = action.payload;
    },
    
    // Clear selections
    clearSelections: (state) => {
      state.selectedCustomerId = null;
      state.selectedVehicleId = null;
      state.selectedAppointmentId = null;
      state.selectedRepairOrderId = null;
    },
    
    // Update appointment locally (for real-time updates)
    updateAppointmentLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Appointment> }>) => {
      const { id, updates } = action.payload;
      const index = state.appointments.findIndex(appointment => appointment.id === id);
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], ...updates };
      }
    },
    
    // Update repair order locally (for real-time updates)
    updateRepairOrderLocal: (state, action: PayloadAction<{ id: string; updates: Partial<RepairOrder> }>) => {
      const { id, updates } = action.payload;
      const index = state.repairOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        state.repairOrders[index] = { ...state.repairOrders[index], ...updates };
      }
    },
  },
  
  extraReducers: (builder) => {
    // ============================================================================
    // AUTH REDUCERS (merged from authSlice)
    // ============================================================================
    
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.error.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.error.login = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading.register = true;
        state.error.register = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading.register = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading.register = false;
        state.error.register = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading.logout = true;
        state.error.logout = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading.logout = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logout = false;
        state.error.logout = action.payload as string;
        // Still logout on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading.refresh = true;
        state.error.refresh = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading.refresh = false;
        state.error.refresh = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading.getCurrentUser = true;
        state.error.getCurrentUser = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading.getCurrentUser = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading.getCurrentUser = false;
        state.error.getCurrentUser = action.payload as string;
      })
      
      // Password Reset Request
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading.passwordReset = true;
        state.error.passwordReset = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading.passwordReset = false;
        state.passwordResetEmail = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading.passwordReset = false;
        state.error.passwordReset = action.payload as string;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading.passwordReset = true;
        state.error.passwordReset = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading.passwordReset = false;
        state.passwordResetEmail = null;
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
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error.updateProfile = action.payload as string;
      });

    // ============================================================================
    // VEHICLE REDUCERS
    // ============================================================================
    
    builder
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
      
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading.createVehicle = true;
        state.error.createVehicle = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading.createVehicle = false;
        state.vehicles.push(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading.createVehicle = false;
        state.error.createVehicle = action.payload as string;
      })
      
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading.updateVehicle = true;
        state.error.updateVehicle = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading.updateVehicle = false;
        const index = state.vehicles.findIndex(vehicle => vehicle.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading.updateVehicle = false;
        state.error.updateVehicle = action.payload as string;
      })
      
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading.deleteVehicle = true;
        state.error.deleteVehicle = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading.deleteVehicle = false;
        state.vehicles = state.vehicles.filter(vehicle => vehicle.id !== action.payload);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading.deleteVehicle = false;
        state.error.deleteVehicle = action.payload as string;
      });

    // ============================================================================
    // CUSTOMER REDUCERS
    // ============================================================================
    
    builder
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
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading.createCustomer = true;
        state.error.createCustomer = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading.createCustomer = false;
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading.createCustomer = false;
        state.error.createCustomer = action.payload as string;
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading.updateCustomer = true;
        state.error.updateCustomer = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading.updateCustomer = false;
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading.updateCustomer = false;
        state.error.updateCustomer = action.payload as string;
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading.deleteCustomer = true;
        state.error.deleteCustomer = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading.deleteCustomer = false;
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading.deleteCustomer = false;
        state.error.deleteCustomer = action.payload as string;
      });

    // ============================================================================
    // REPAIR JOB REDUCERS (Legacy)
    // ============================================================================
    
    builder
      .addCase(fetchRepairJobs.pending, (state) => {
        state.loading.repairJobs = true;
        state.error.repairJobs = null;
      })
      .addCase(fetchRepairJobs.fulfilled, (state, action) => {
        state.loading.repairJobs = false;
        state.repairJobs = action.payload;
      })
      .addCase(fetchRepairJobs.rejected, (state, action) => {
        state.loading.repairJobs = false;
        state.error.repairJobs = action.payload as string;
      })
      
      // Create repair job
      .addCase(createRepairJob.pending, (state) => {
        state.loading.createJob = true;
        state.error.createJob = null;
      })
      .addCase(createRepairJob.fulfilled, (state, action) => {
        state.loading.createJob = false;
        state.repairJobs.push(action.payload);
      })
      .addCase(createRepairJob.rejected, (state, action) => {
        state.loading.createJob = false;
        state.error.createJob = action.payload as string;
      })
      
      // Update repair job status
      .addCase(updateRepairJobStatus.pending, (state) => {
        state.loading.updateJob = true;
        state.error.updateJob = null;
      })
      .addCase(updateRepairJobStatus.fulfilled, (state, action) => {
        state.loading.updateJob = false;
        const index = state.repairJobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.repairJobs[index] = action.payload;
        }
      })
      .addCase(updateRepairJobStatus.rejected, (state, action) => {
        state.loading.updateJob = false;
        state.error.updateJob = action.payload as string;
      });

    // ============================================================================
    // APPOINTMENT REDUCERS
    // ============================================================================
    
    builder
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
      
      // Fetch today's appointments
      .addCase(fetchTodaysAppointments.fulfilled, (state, action) => {
        state.todaysAppointments = action.payload;
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading.createAppointment = true;
        state.error.createAppointment = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading.createAppointment = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading.createAppointment = false;
        state.error.createAppointment = action.payload as string;
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading.updateAppointment = true;
        state.error.updateAppointment = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading.updateAppointment = false;
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading.updateAppointment = false;
        state.error.updateAppointment = action.payload as string;
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      
      // Confirm appointment
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      
      // Reschedule appointment
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      
      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading.deleteAppointment = true;
        state.error.deleteAppointment = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading.deleteAppointment = false;
        state.appointments = state.appointments.filter(appointment => appointment.id !== action.payload);
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading.deleteAppointment = false;
        state.error.deleteAppointment = action.payload as string;
      });

    // ============================================================================
    // REPAIR ORDER REDUCERS
    // ============================================================================
    
    builder
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
      
      // Fetch active repair orders
      .addCase(fetchActiveRepairOrders.fulfilled, (state, action) => {
        state.activeRepairOrders = action.payload;
      })
      
      // Create repair order
      .addCase(createRepairOrder.pending, (state) => {
        state.loading.createRepairOrder = true;
        state.error.createRepairOrder = null;
      })
      .addCase(createRepairOrder.fulfilled, (state, action) => {
        state.loading.createRepairOrder = false;
        state.repairOrders.push(action.payload);
      })
      .addCase(createRepairOrder.rejected, (state, action) => {
        state.loading.createRepairOrder = false;
        state.error.createRepairOrder = action.payload as string;
      })
      
      // Create repair order from appointment
      .addCase(createRepairOrderFromAppointment.fulfilled, (state, action) => {
        state.repairOrders.push(action.payload);
      })
      
      // Update repair order
      .addCase(updateRepairOrder.pending, (state) => {
        state.loading.updateRepairOrder = true;
        state.error.updateRepairOrder = null;
      })
      .addCase(updateRepairOrder.fulfilled, (state, action) => {
        state.loading.updateRepairOrder = false;
        const index = state.repairOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.repairOrders[index] = action.payload;
        }
      })
      .addCase(updateRepairOrder.rejected, (state, action) => {
        state.loading.updateRepairOrder = false;
        state.error.updateRepairOrder = action.payload as string;
      })
      
      // Update repair order status
      .addCase(updateRepairOrderStatus.fulfilled, (state, action) => {
        const index = state.repairOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.repairOrders[index] = action.payload;
        }
      })
      
      // Assign technician
      .addCase(assignTechnician.fulfilled, (state, action) => {
        const index = state.repairOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.repairOrders[index] = action.payload;
        }
      })
      
      // Complete repair order
      .addCase(completeRepairOrder.fulfilled, (state, action) => {
        const index = state.repairOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.repairOrders[index] = action.payload;
        }
      })
      
      // Delete repair order
      .addCase(deleteRepairOrder.pending, (state) => {
        state.loading.deleteRepairOrder = true;
        state.error.deleteRepairOrder = null;
      })
      .addCase(deleteRepairOrder.fulfilled, (state, action) => {
        state.loading.deleteRepairOrder = false;
        state.repairOrders = state.repairOrders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteRepairOrder.rejected, (state, action) => {
        state.loading.deleteRepairOrder = false;
        state.error.deleteRepairOrder = action.payload as string;
      });

    // ============================================================================
    // EMPLOYEE REDUCERS
    // ============================================================================
    
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading.employees = true;
        state.error.employees = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading.employees = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading.employees = false;
        state.error.employees = action.payload as string;
      })
      
      // Fetch technicians
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        // Update only technicians in the employees array or add them
        const technicians = action.payload;
        
        // Remove existing technicians and add updated ones
        state.employees = [
          ...state.employees.filter(emp => emp.role !== 'technician'),
          ...technicians
        ];
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading.createEmployee = true;
        state.error.createEmployee = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading.createEmployee = false;
        state.employees.push(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading.createEmployee = false;
        state.error.createEmployee = action.payload as string;
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading.updateEmployee = true;
        state.error.updateEmployee = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.updateEmployee = false;
        const index = state.employees.findIndex(employee => employee.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading.updateEmployee = false;
        state.error.updateEmployee = action.payload as string;
      });

    // ============================================================================
    // SHOP REDUCERS
    // ============================================================================
    
    builder
      .addCase(fetchShops.pending, (state) => {
        state.loading.shops = true;
        state.error.shops = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading.shops = false;
        state.shops = action.payload;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading.shops = false;
        state.error.shops = action.payload as string;
      });

    // ============================================================================
    // SERVICE CATEGORY REDUCERS
    // ============================================================================
    
    builder
      .addCase(fetchServiceCategories.pending, (state) => {
        state.loading.serviceCategories = true;
        state.error.serviceCategories = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.loading.serviceCategories = false;
        state.serviceCategories = action.payload;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.loading.serviceCategories = false;
        state.error.serviceCategories = action.payload as string;
      });

    // ============================================================================
    // DASHBOARD REDUCERS
    // ============================================================================
    
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading.dashboard = true;
        state.error.dashboard = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboardSummary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error.dashboard = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearError,
  clearAuthError,
  clearAllAuthErrors,
  clearPasswordResetEmail,
  selectCustomer,
  selectVehicle,
  selectAppointment,
  selectRepairOrder,
  setAppointmentFilters,
  setRepairOrderFilters,
  clearSelections,
  updateAppointmentLocal,
  updateRepairOrderLocal,
} = autoRepairsSlice.actions;

export default autoRepairsSlice.reducer;
