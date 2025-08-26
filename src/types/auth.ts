/**
 * Authentication Domain Types
 * Single source of truth for all authentication-related type definitions
 */

import type { APIErrorResponse, BaseAPIResponse } from "./api";

// Core User interface - unified from both service and UI needs
export interface User {
  id: string | number; // Support both string and number IDs
  email: string;
  firstName: string;
  lastName: string;
  first_name?: string; // Backend compatibility
  last_name?: string; // Backend compatibility
  username?: string;
  role: 'owner' | 'employee' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  is_active?: boolean; // Backend compatibility
  createdAt: string;
  created_at?: string; // Backend compatibility
  date_joined?: string; // Backend compatibility
  lastLogin?: string;
  last_login?: string; // Backend compatibility
  
  // Optional extended fields
  roleDisplay?: string;
  isEmailVerified?: boolean;
  permissions?: string[];
  preferences?: UserPreferences;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: string;
    refreshInterval: number;
  };
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  first_name?: string; // Backend compatibility
  last_name?: string; // Backend compatibility
  phone?: string;
  role?: 'customer' | 'employee';
  shopCode?: string; // For employee registration
}

// Authentication response
export interface AuthResponse {
  token: string;
  refresh?: string;
  user: User;
  expiresIn?: number;
  tokenType?: string;
}

// Login response
export interface LoginResponse extends AuthResponse {
  message?: string;
}

// Registration response
export interface RegisterResponse {
  message: string;
  email: string;
  user?: User;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset confirmation
export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

// Password change request
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

// Profile update data
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  first_name?: string; // Backend compatibility
  last_name?: string; // Backend compatibility
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string | File;
  preferences?: Partial<UserPreferences>;
}

// User profile response from API
export interface UserProfileResponse {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  phone?: string;
  avatar?: string;
}

// Token refresh response
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

// User permissions
export interface UserPermissions {
  canViewFinancialData: boolean;
  canManageUsers: boolean;
  canManageShops: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canManageInventory: boolean;
  canProcessPayments: boolean;
  canAccessAdminPanel: boolean;
  canManageSettings: boolean;
  canViewCustomerData: boolean;
}

// Permission check function type
export type PermissionCheck = (user: User | null) => boolean;

// Role-based access control
export interface RolePermissions {
  owner: UserPermissions;
  employee: UserPermissions;
  customer: UserPermissions;
}

// Session information
export interface UserSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  isActive: boolean;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}
export interface UserAPIResponse extends BaseAPIResponse {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string;
}

export interface UserListAPIResponse {
  count?: number;
  results?: UserAPIResponse[];
  users?: UserAPIResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface UserStatsAPIResponse {
  total_users: number;
  active_users: number;
  new_this_month: number;
  by_role: Array<{
    role: string;
    count: number;
  }>;
  recentUsers: UserAPIResponse[];
}


export interface UserProfileResponse extends BaseAPIResponse {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

// Bulk Update Response
export interface BulkUpdateResponse {
  updated_count: number;
  updated_users?: UserAPIResponse[];
  errors?: APIErrorResponse[];
}

// Settings Responses
export interface PasswordPolicyResponse {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  max_age_days?: number;
}

// Authentication state
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordResetEmail: string | null;
  sessionExpiry: Date | null;
}

// Two-factor authentication
export interface TwoFactorAuth {
  enabled: boolean;
  method: 'sms' | 'email' | 'app';
  backupCodes?: string[];
  lastUsed?: string;
}

// Account verification
export interface AccountVerification {
  email: {
    verified: boolean;
    verifiedAt?: string;
    token?: string;
  };
  phone: {
    verified: boolean;
    verifiedAt?: string;
    code?: string;
  };
}

// User activity log
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

// Account lockout information
export interface AccountLockout {
  isLocked: boolean;
  lockoutReason?: string;
  lockedAt?: string;
  unlockAt?: string;
  failedAttempts: number;
}

export type UserRole = User['role'];
export type AuthProvider = 'local' | 'google' | 'microsoft' | 'apple';
