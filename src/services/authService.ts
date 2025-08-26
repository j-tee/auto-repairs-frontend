import type { RegisterData } from '../types';
import { 
  apiPost, 
  apiGet, 
  apiPut,
  setAuthToken, 
  removeAuthToken, 
  getAuthToken 
} from '../utils/api';

// User Permissions (from backend)
export interface UserPermissions {
  can_manage_shops: boolean;
  can_manage_employees: boolean;
  can_view_all_orders: boolean;
  can_create_repair_orders: boolean;
  can_manage_inventory: boolean;
  can_view_financial_data: boolean;
  is_owner: boolean;
  is_employee: boolean;
  is_customer: boolean;
}

// User API Response (matches actual backend schema)
export interface UserAPIResponse {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'employee' | 'customer';
  role_display: string;
  is_email_verified: boolean;
  date_joined: string;
  permissions: UserPermissions;
}

// Token API Response (matches actual backend schema)
export interface TokenAPIResponse {
  access: string;
  refresh: string;
}

// User interface for frontend use
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'employee' | 'customer';
  roleDisplay: string;
  isEmailVerified: boolean;
  createdAt: string;
  permissions: UserPermissions;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// export interface RegisterData {
//   email: string;
//   username: string;
//   password: string;
//   password_confirm: string;
//   first_name: string;
//   last_name: string;
//   role?: 'owner' | 'employee' | 'customer';
// }

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  username?: string;
}

// Helper function to transform API response to frontend User
const transformUserData = (apiUser: UserAPIResponse): User => {
  return {
    id: apiUser.id.toString(),
    email: apiUser.email,
    username: apiUser.username,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    role: apiUser.role,
    roleDisplay: apiUser.role_display,
    isEmailVerified: apiUser.is_email_verified,
    createdAt: apiUser.date_joined,
    permissions: apiUser.permissions
  };
};

// Authentication Service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Get tokens from /api/token/
    const response = await apiPost<TokenAPIResponse>('/api/token/', {
      email: credentials.email,
      password: credentials.password
    });
    
    const authResponse: AuthResponse = {
      token: response.access,
      refreshToken: response.refresh,
      user: {} as User,
      expiresIn: 3600
    };
    
    setAuthToken(authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    
    try {
      // Get user profile from /api/auth/user/
      const userData = await apiGet<UserAPIResponse>('/api/auth/user/');
      
      const user = transformUserData(userData);
      authResponse.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (userError) {
      console.error('Failed to fetch user data:', userError);
      // Create minimal user object if profile fetch fails
      authResponse.user = {
        id: '',
        email: credentials.email,
        username: '',
        firstName: '',
        lastName: '',
        role: 'customer',
        roleDisplay: 'Customer',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        permissions: {
          can_manage_shops: false,
          can_manage_employees: false,
          can_view_all_orders: false,
          can_create_repair_orders: false,
          can_manage_inventory: false,
          can_view_financial_data: false,
          is_owner: false,
          is_employee: false,
          is_customer: true
        }
      };
      localStorage.setItem('user', JSON.stringify(authResponse.user));
    }
    
    return authResponse;
  },

  // Register user
  register: async (userData: RegisterData): Promise<{ message: string; email: string }> => {
    const response = await apiPost<{ message: string; user_id: string; email: string; role: string }>('/api/auth/register/', userData);
    
    return {
      message: response.message,
      email: response.email
    };
  },

  // Verify email
  verifyEmail: async (data: EmailVerificationRequest): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>('/api/auth/verify-email/', data);
  },

  // Resend verification email
  resendVerification: async (data: ResendVerificationRequest): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>('/api/auth/resend-verification/', data);
  },

  // Logout user (client-side only for JWT)
  logout: async (): Promise<void> => {
    removeAuthToken();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiPost<TokenAPIResponse>('/api/token/refresh/', { 
      refresh: refreshToken 
    });
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      throw new Error('No user data available');
    }
    
    const authResponse: AuthResponse = {
      token: response.access,
      refreshToken: response.refresh || refreshToken, // Use new refresh token if provided
      user: user,
      expiresIn: 3600
    };
    
    setAuthToken(authResponse.token);
    if (response.refresh) {
      localStorage.setItem('refreshToken', response.refresh);
    }
    
    return authResponse;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const userData = await apiGet<UserAPIResponse>('/api/auth/user/');
    const user = transformUserData(userData);
    
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  // Update user profile
  updateProfile: async (updateData: ProfileUpdateData): Promise<User> => {
    const updatedUserData = await apiPut<UserAPIResponse>('/api/auth/user/update/', updateData);
    const user = transformUserData(updatedUserData);
    
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = getAuthToken();
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  },

  // Get current user from storage
  getCurrentUserFromStorage: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Admin: Get all users (owners only)
  getAllUsers: async (): Promise<User[]> => {
    const usersData = await apiGet<UserAPIResponse[]>('/api/admin/users/');
    return usersData.map(transformUserData);
  },

  // Admin: Update user role (owners only)
  updateUserRole: async (userId: string, role: 'owner' | 'employee' | 'customer'): Promise<User> => {
    const updatedUserData = await apiPut<{ message: string; user: UserAPIResponse }>(`/api/admin/users/${userId}/role/`, { role });
    return transformUserData(updatedUserData.user);
  }
};
