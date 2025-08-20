import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiPost, apiGet, setAuthToken, removeAuthToken, getAuthToken } from '../../utils/api';

// User types
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

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Django JWT uses /token/ for login with email and password
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };
      
      const response = await apiPost<{ access: string; refresh: string }>('/token/', loginData);
      
      // Django JWT returns 'access' and 'refresh' tokens
      const authResponse: AuthResponse = {
        token: response.access,
        refreshToken: response.refresh,
        // We'll need to get user info separately since Django JWT doesn't return user data
        user: {} as User, // Temporary - will fetch user data next
        expiresIn: 3600 // Default, can be configured
      };
      
      // Store tokens
      setAuthToken(authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      
      // Get user information from a separate endpoint
      try {
        const userData = await apiGet<any>('/auth/user/');
        
        // Transform Django snake_case fields to frontend camelCase
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
        // If we can't get user data, create minimal user object
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
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      // Register user first
      const registerData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer'
      };
      
      const registerResponse = await apiPost<User>('/auth/register/', registerData);
      
      // After successful registration, login to get tokens
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
      
      // Store tokens and user data
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
  'auth/logout',
  async () => {
    try {
      // For Django JWT, we can blacklist the refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiPost('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and token
      removeAuthToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiPost<{ access: string }>('/token/refresh/', { refresh: refreshToken });
      
      // Get current user data
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        throw new Error('No user data available');
      }
      
      const authResponse: AuthResponse = {
        token: response.access,
        refreshToken: refreshToken, // Keep the same refresh token
        user: user,
        expiresIn: 3600
      };
      
      // Update access token
      setAuthToken(authResponse.token);
      
      return authResponse;
    } catch (error) {
      // If refresh fails, logout user
      removeAuthToken();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const userData = await apiGet<any>('/auth/user/');
      
      // Transform Django snake_case fields to frontend camelCase
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
  'auth/requestPasswordReset',
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
  'auth/resetPassword',
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
  'auth/updateProfile',
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

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: {
    login: boolean;
    register: boolean;
    logout: boolean;
    refresh: boolean;
    getCurrentUser: boolean;
    passwordReset: boolean;
    updateProfile: boolean;
  };
  error: {
    login: string | null;
    register: string | null;
    logout: string | null;
    refresh: string | null;
    getCurrentUser: string | null;
    passwordReset: string | null;
    updateProfile: string | null;
  };
  passwordResetEmail: string | null;
}

// Initial state - check for existing auth data
const getInitialState = (): AuthState => {
  const token = getAuthToken();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    user,
    token,
    isAuthenticated: !!(token && user),
    loading: {
      login: false,
      register: false,
      logout: false,
      refresh: false,
      getCurrentUser: false,
      passwordReset: false,
      updateProfile: false,
    },
    error: {
      login: null,
      register: null,
      logout: null,
      refresh: null,
      getCurrentUser: null,
      passwordReset: null,
      updateProfile: null,
    },
    passwordResetEmail: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearAuthError: (state, action: PayloadAction<keyof AuthState['error']>) => {
      state.error[action.payload] = null;
    },
    clearAllAuthErrors: (state) => {
      state.error = {
        login: null,
        register: null,
        logout: null,
        refresh: null,
        getCurrentUser: null,
        passwordReset: null,
        updateProfile: null,
      };
    },
    clearPasswordResetEmail: (state) => {
      state.passwordResetEmail = null;
    },
  },
  extraReducers: (builder) => {
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
  },
});

export const { clearAuthError, clearAllAuthErrors, clearPasswordResetEmail } = authSlice.actions;
export default authSlice.reducer;
