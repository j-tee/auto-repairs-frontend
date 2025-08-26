import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  customerMngtService,
  vehicleMngtService,
  appointmentMngtService,
  repairOrderMngtService,
  authService
} from '../../services';
import { apiPost, apiGet, setAuthToken, removeAuthToken, getAuthToken } from '../../utils/api';
import { getAPIErrorMessage } from '../../types/common';
import type { 
  GenericAPIResponse,
} from '../../types/api';

// Import types from our centralized type system
import type {
  // Auth types
  User,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordReset,
  
  // Core entity types
  Vehicle,
  CreateVehicleData,
  VehicleQuery,
  
  Customer,
  CreateCustomerData,
  CustomerQuery,
  
  CreateAppointmentData,
  AppointmentQuery,
  
  RepairOrder,
  CreateRepairOrderData,
  RepairOrderQuery,
  CompleteWorkData,
  AddServiceData,
  AddPartData,
  CostBreakdown,
  WorkmanshipAnalytics,
  
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeQuery,
  
  Shop,
  RefreshTokenResponse,
  UserProfileResponse
} from '../../types';
import type { Appointment } from '../../types/appointments';

// ============================================================================
// AUTH TYPES (merged from authSlice)
// ============================================================================

// Note: User interface now imported from centralized types

// export interface LoginCredentialsExtended extends LoginCredentials {
//   // Any slice-specific login extensions can go here
// }

// export interface PasswordResetRequestExtended extends PasswordResetRequest {
//   // Any slice-specific password reset extensions can go here
// }

// export interface PasswordResetExtended extends PasswordReset {
//   // Any slice-specific password reset extensions can go here
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
  employees: Employee[];
  shops: Shop[];
  
  // Repair Order Completion System Data (advanced features - placeholders)
  costBreakdowns: Record<string, CostBreakdown>; // Placeholder for future implementation
  relatedAppointments: Record<string, Appointment[]>; // Placeholder for future implementation  
  workmanshipAnalytics: Record<string, WorkmanshipAnalytics>; // Placeholder for future implementation  // Granular loading states
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
    // Completion system loading states
    costBreakdown: boolean;
    relatedAppointments: boolean;
    startWork: boolean;
    completeWork: boolean;
    addService: boolean;
    addPart: boolean;
    linkAppointment: boolean;
    workmanshipAnalytics: boolean;
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
    // Completion system error states
    costBreakdown: string | null;
    relatedAppointments: string | null;
    startWork: string | null;
    completeWork: string | null;
    addService: string | null;
    addPart: string | null;
    linkAppointment: string | null;
    workmanshipAnalytics: string | null;
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
    } catch (error: unknown) {
      return rejectWithValue(getAPIErrorMessage(error) || 'Login failed');
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
      // Register only returns message and email, not a full auth response
      return authResponse;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'autoRepairs/logout',
  async () => {
    try {
      await authService.logout();
    } catch {
      console.warn('Logout request failed, but continuing with local logout');
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
      
      const response = await apiPost<RefreshTokenResponse>('/auth/refresh/', { refresh: refreshToken });
      
      if (response.access) {
        setAuthToken(response.access);
        localStorage.setItem('auth_token', response.access);
        return { token: response.access };
      }
      
      throw new Error('Invalid response format');
    } catch (error: unknown) {
      removeAuthToken();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Token refresh failed');
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
      
      const response = await apiGet<UserProfileResponse>('/auth/user/');
      return {
        token,
        user: response
      };
    } catch (error: unknown) {
      removeAuthToken();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Authentication failed');
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
    } catch {
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
      const response = await apiPost<GenericAPIResponse>('/auth/password-reset/', data);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'autoRepairs/resetPassword',
  async (data: PasswordReset, { rejectWithValue }) => {
    try {
      const response = await apiPost<GenericAPIResponse>('/auth/password-reset/confirm/', data);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Password reset failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'autoRepairs/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiPost<UserProfileResponse>('/auth/profile/', userData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Profile update failed');
    }
  }
);

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Vehicles
export const fetchVehicles = createAsyncThunk(
  'autoRepairs/fetchVehicles',
  async (filters: VehicleQuery = {}, { rejectWithValue }) => {
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
  async (vehicleData: CreateVehicleData, { rejectWithValue }) => {
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
  async (filters: CustomerQuery = {}, { rejectWithValue }) => {
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
  async (customerData: CreateCustomerData, { rejectWithValue }) => {
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
  async (filters: AppointmentQuery = {}, { rejectWithValue }) => {
    try {
      const response = await appointmentMngtService.getAppointments(filters);
      return response.appointments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'autoRepairs/createAppointment',
  async (appointmentData: CreateAppointmentData, { rejectWithValue }) => {
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

// Repair Orders
export const fetchRepairOrders = createAsyncThunk(
  'autoRepairs/fetchRepairOrders',
  async (filters: RepairOrderQuery = {}, { rejectWithValue }) => {
    try {
      const response = await repairOrderMngtService.getRepairOrders(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createRepairOrder = createAsyncThunk(
  'autoRepairs/createRepairOrder',
  async (repairOrderData: CreateRepairOrderData, { rejectWithValue }) => {
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
      // Transform vehicle property to vehicle ID if it's an object
      const updateData: Record<string, unknown> = { ...data };
      if (data.vehicle && typeof data.vehicle === 'object' && 'id' in data.vehicle) {
        updateData.vehicle = data.vehicle.id;
      }
      const response = await repairOrderMngtService.updateRepairOrder(Number(id), updateData);
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
      await repairOrderMngtService.deleteRepairOrder(Number(id));
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Repair Order Completion System Thunks
// Placeholder operations for Employee and Shop (since these services may not be fully implemented)

export const getCostBreakdown = createAsyncThunk(
  'autoRepairs/getCostBreakdown',
  async (repairOrderId: string, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockCostBreakdown: CostBreakdown = {
        labor: 150,
        parts: 300,
        total: 450,
        tax: 45
      };
      return { repairOrderId, costBreakdown: mockCostBreakdown };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const getRelatedAppointments = createAsyncThunk(
  'autoRepairs/getRelatedAppointments',
  async (repairOrderId: string, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockAppointments: Appointment[] = [];
      return { repairOrderId, appointments: mockAppointments };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const startWork = createAsyncThunk(
  'autoRepairs/startWork',
  async (repairOrderId: string, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockWorkData = { status: 'in_progress', startedAt: new Date().toISOString() };
      return { repairOrderId, workData: mockWorkData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const completeWork = createAsyncThunk(
  'autoRepairs/completeWork',
  async ({ repairOrderId, completionData }: { repairOrderId: string; completionData: CompleteWorkData }, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockResponse = { 
        repairOrderId, 
        status: 'completed', 
        completedAt: new Date().toISOString(),
        ...completionData 
      };
      return mockResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addService = createAsyncThunk(
  'autoRepairs/addService',
  async ({ repairOrderId, serviceData }: { repairOrderId: string; serviceData: AddServiceData }, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockResponse = { 
        repairOrderId, 
        service: { id: Date.now().toString(), ...serviceData } 
      };
      return mockResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addPart = createAsyncThunk(
  'autoRepairs/addPart',
  async ({ repairOrderId, partData }: { repairOrderId: string; partData: AddPartData }, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockResponse = { 
        repairOrderId, 
        part: { id: Date.now().toString(), ...partData } 
      };
      return mockResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const linkAppointment = createAsyncThunk(
  'autoRepairs/linkAppointment',
  async ({ repairOrderId, appointmentId }: { repairOrderId: string; appointmentId: string }, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockResponse = { 
        repairOrderId, 
        appointmentId, 
        linked: true,
        linkedAt: new Date().toISOString() 
      };
      return mockResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const getWorkmanshipAnalytics = createAsyncThunk(
  'autoRepairs/getWorkmanshipAnalytics',
  async (repairOrderId: string, { rejectWithValue }) => {
    try {
      // Placeholder implementation - service method doesn't exist yet
      const mockAnalytics: WorkmanshipAnalytics = {
        averageTime: 120,
        successRate: 95,
        customerSatisfaction: 4.5
      };
      return { repairOrderId, analytics: mockAnalytics };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Placeholder operations for Employee and Shop (since these services may not be fully implemented)
export const fetchEmployees = createAsyncThunk(
  'autoRepairs/fetchEmployees',
  async (_: EmployeeQuery, { rejectWithValue }) => {
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
  async (employeeData: CreateEmployeeData, { rejectWithValue }) => {
    try {
      // For now, return mock data until employee service is implemented
      const mockEmployee: Employee = {
        id: Date.now().toString(),
        shop: employeeData.shop,
        name: employeeData.name,
        role: employeeData.role,
        phone: employeeData.phone_number || '',
        email: employeeData.email || null,
        picture: employeeData.picture || null,
        user: employeeData.user || null
      };
      return mockEmployee;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'autoRepairs/updateEmployee',
  async ({ id, data }: { id: string; data: UpdateEmployeeData }, { rejectWithValue }) => {
    try {
      // For now, return mock data until employee service is implemented
      return { ...data, id } as Employee;
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

// ============================================================================
// INITIAL STATE
// ============================================================================

// Function to get initial auth state from localStorage
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
    console.error('Error restoring auth state from localStorage:', error);
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
  
  // Completion system data
  costBreakdowns: {},
  relatedAppointments: {},
  workmanshipAnalytics: {},
  
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
    // Completion system loading states
    costBreakdown: false,
    relatedAppointments: false,
    startWork: false,
    completeWork: false,
    addService: false,
    addPart: false,
    linkAppointment: false,
    workmanshipAnalytics: false,
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
    // Completion system error states
    costBreakdown: null,
    relatedAppointments: null,
    startWork: null,
    completeWork: null,
    addService: null,
    addPart: null,
    linkAppointment: null,
    workmanshipAnalytics: null,
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
        // Transform auth service user to match our User interface
        const authUser = action.payload.user;
        
        // Convert UserPermissions object to string array if needed
        let permissions: string[] | undefined;
        if (authUser.permissions && typeof authUser.permissions === 'object') {
          // Convert UserPermissions object to string array
          permissions = Object.entries(authUser.permissions)
            .filter(([, value]) => value === true)
            .map(([key]) => key);
        } else if (Array.isArray(authUser.permissions)) {
          permissions = authUser.permissions;
        }
        
        state.user = {
          ...authUser,
          permissions,
          isActive: true, // Default to active for logged-in users
          avatar: undefined,
          phone: undefined,
          address: undefined,
          lastLogin: new Date().toISOString()
        };
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
        // Transform UserProfileResponse to our User interface
        const profileUser = action.payload.user;
        state.user = {
          id: String(profileUser.id),
          email: profileUser.email,
          firstName: profileUser.first_name,
          lastName: profileUser.last_name,
          role: (profileUser.role as 'owner' | 'employee' | 'customer') || 'customer',
          username: profileUser.username,
          isActive: true,
          createdAt: profileUser.date_joined,
          lastLogin: undefined, // Not available in UserProfileResponse
          phone: undefined, // Not available in UserProfileResponse
          avatar: undefined // Not available in UserProfileResponse
        };
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
        // Transform UserProfileResponse to our User interface
        const profileUser = action.payload;
        if (state.user) {
          state.user = {
            ...state.user,
            id: String(profileUser.id),
            email: profileUser.email,
            firstName: profileUser.first_name,
            lastName: profileUser.last_name,
            role: (profileUser.role as 'owner' | 'employee' | 'customer') || state.user.role,
            username: profileUser.username,
            phone: state.user.phone, // Keep existing phone as it's not in UserProfileResponse
            avatar: state.user.avatar // Keep existing avatar as it's not in UserProfileResponse
          };
        }
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
      // Repair Orders
      .addCase(fetchRepairOrders.pending, (state) => {
        state.loading.repairOrders = true;
        state.error.repairOrders = null;
      })
      .addCase(fetchRepairOrders.fulfilled, (state, action) => {
        state.loading.repairOrders = false;
        state.repairOrders = action.payload || [];
      })
      .addCase(fetchRepairOrders.rejected, (state, action) => {
        state.loading.repairOrders = false;
        state.error.repairOrders = action.payload as string;
      })
      
      // Completion System Reducers
      .addCase(getCostBreakdown.pending, (state) => {
        state.loading.costBreakdown = true;
        state.error.costBreakdown = null;
      })
      .addCase(getCostBreakdown.fulfilled, (state, action) => {
        state.loading.costBreakdown = false;
        state.costBreakdowns[action.payload.repairOrderId] = action.payload.costBreakdown;
      })
      .addCase(getCostBreakdown.rejected, (state, action) => {
        state.loading.costBreakdown = false;
        state.error.costBreakdown = action.payload as string;
      })
      
      .addCase(getRelatedAppointments.pending, (state) => {
        state.loading.relatedAppointments = true;
        state.error.relatedAppointments = null;
      })
      .addCase(getRelatedAppointments.fulfilled, (state, action) => {
        state.loading.relatedAppointments = false;
        state.relatedAppointments[action.payload.repairOrderId] = action.payload.appointments || [];
      })
      .addCase(getRelatedAppointments.rejected, (state, action) => {
        state.loading.relatedAppointments = false;
        state.error.relatedAppointments = action.payload as string;
      })
      
      .addCase(startWork.pending, (state) => {
        state.loading.startWork = true;
        state.error.startWork = null;
      })
      .addCase(startWork.fulfilled, (state, action) => {
        state.loading.startWork = false;
        // Update the repair order status in the list
        const index = state.repairOrders.findIndex(order => String(order.id) === String(action.meta.arg));
        if (index !== -1) {
          state.repairOrders[index] = { ...state.repairOrders[index], status: 'in_progress' };
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
        // Update the repair order status in the list
        const index = state.repairOrders.findIndex(order => String(order.id) === String(action.meta.arg.repairOrderId));
        if (index !== -1) {
          state.repairOrders[index] = { ...state.repairOrders[index], status: 'completed' };
        }
      })
      .addCase(completeWork.rejected, (state, action) => {
        state.loading.completeWork = false;
        state.error.completeWork = action.payload as string;
      })
      
      .addCase(addService.pending, (state) => {
        state.loading.addService = true;
        state.error.addService = null;
      })
      .addCase(addService.fulfilled, (state) => {
        state.loading.addService = false;
        // Refresh cost breakdown after adding service
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading.addService = false;
        state.error.addService = action.payload as string;
      })
      
      .addCase(addPart.pending, (state) => {
        state.loading.addPart = true;
        state.error.addPart = null;
      })
      .addCase(addPart.fulfilled, (state) => {
        state.loading.addPart = false;
        // Refresh cost breakdown after adding part
      })
      .addCase(addPart.rejected, (state, action) => {
        state.loading.addPart = false;
        state.error.addPart = action.payload as string;
      })
      
      .addCase(linkAppointment.pending, (state) => {
        state.loading.linkAppointment = true;
        state.error.linkAppointment = null;
      })
      .addCase(linkAppointment.fulfilled, (state) => {
        state.loading.linkAppointment = false;
        // Could refresh related appointments
      })
      .addCase(linkAppointment.rejected, (state, action) => {
        state.loading.linkAppointment = false;
        state.error.linkAppointment = action.payload as string;
      })
      
      .addCase(getWorkmanshipAnalytics.pending, (state) => {
        state.loading.workmanshipAnalytics = true;
        state.error.workmanshipAnalytics = null;
      })
      .addCase(getWorkmanshipAnalytics.fulfilled, (state, action) => {
        state.loading.workmanshipAnalytics = false;
        state.workmanshipAnalytics[action.payload.repairOrderId] = action.payload.analytics;
      })
      .addCase(getWorkmanshipAnalytics.rejected, (state, action) => {
        state.loading.workmanshipAnalytics = false;
        state.error.workmanshipAnalytics = action.payload as string;
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
  clearUser 
} = autoRepairsSlice.actions;
export default autoRepairsSlice.reducer;
