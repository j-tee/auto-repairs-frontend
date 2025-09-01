import type { AuthResponse, LoginCredentials, PasswordReset, PasswordResetRequest, RegisterData } from '../types/auth';
import type { User, UserResponse } from '../types/userManagement';
import { 
  apiPost, 
  apiGet, 
  setAuthToken, 
  removeAuthToken, 
  getAuthToken 
} from '../utils/api';

// Auth types


// Authentication Service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
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
      const userData = await apiGet<UserResponse>('/auth/user/');
      
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
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
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
  },

  // Logout user
  logout: async (): Promise<void> => {
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
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
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
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const userData = await apiGet<UserResponse>('/auth/user/');
    
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
  },

  // Request password reset
  requestPasswordReset: async (data: PasswordResetRequest): Promise<string> => {
    await apiPost('/auth/password-reset/', data);
    return data.email;
  },

  // Reset password
  resetPassword: async (data: PasswordReset): Promise<void> => {
    await apiPost('/auth/password-reset-confirm/', data);
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const updatedUser = await apiPost<User>('/auth/profile/', userData);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
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
  }
};
