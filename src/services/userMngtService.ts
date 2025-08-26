import { authService, type User, type UserPermissions } from './authService';
import { apiGet, apiPost, apiPut, apiDelete, type ApiQueryParams, API_CONFIG } from '../utils/api';

// Extended User interface for admin operations
export interface AdminUser extends User {
  isActive: boolean;
  lastLogin?: string;
  createdBy?: string;
  updatedAt?: string;
}

// User creation data for admin
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'employee' | 'customer';
  is_active?: boolean;
}

// User update data for admin
export interface UpdateUserData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: 'owner' | 'employee' | 'customer';
  is_active?: boolean;
  permissions?: Partial<UserPermissions>;
}

// User query parameters
export interface UserQueryParams extends ApiQueryParams {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// User statistics
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  owners: number;
  employees: number;
  customers: number;
  recent_registrations: number;
}

// Password policy
export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_expiry: number;
  prevent_reuse: number;
}

// Activity log entry
export interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// User list response
export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// User management service
export const userMngtService = {
  // Get all users with filtering and pagination
  getUsers: async (params?: UserQueryParams): Promise<UserListResponse> => {
    return await apiGet<UserListResponse>('/admin/users/', params);
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    return await apiGet<UserStats>('/admin/users/stats/');
  },

  // Create a new user (admin only)
  createUser: async (userData: CreateUserData): Promise<AdminUser> => {
    const response = await apiPost<{ message: string; user: AdminUser }>('/admin/users/', userData);
    return response.user;
  },

  // Update user (admin only)
  updateUser: async (userId: string, userData: UpdateUserData): Promise<AdminUser> => {
    const response = await apiPut<{ message: string; user: AdminUser }>(`/admin/users/${userId}/`, userData);
    return response.user;
  },

  // Activate user
  activateUser: async (userId: string): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>(`/admin/users/${userId}/activate/`);
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>(`/admin/users/${userId}/deactivate/`);
  },

  // Reset user password (admin only)
  resetUserPassword: async (userId: string, newPassword: string): Promise<{ message: string; temp_password: string }> => {
    return await apiPost<{ message: string; temp_password: string }>(`/admin/users/${userId}/reset-password/`, {
      new_password: newPassword
    });
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return await apiDelete<{ message: string }>(`/admin/users/${userId}/`);
  },

  // Get user activity logs
  getUserActivityLog: async (userId: string, params?: { limit?: number; page?: number }): Promise<ActivityLogEntry[]> => {
    return await apiGet<ActivityLogEntry[]>(`/admin/users/${userId}/activity/`, params);
  },

  // Export users to CSV/Excel
  exportUsers: async (params?: UserQueryParams): Promise<Blob> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/export/?${new URLSearchParams(params as Record<string, string>)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export users');
    }
    
    return await response.blob();
  },

  // Get password policy
  getPasswordPolicy: async (): Promise<PasswordPolicy> => {
    return await apiGet<PasswordPolicy>('/admin/password-policy/');
  },

  // Update password policy
  updatePasswordPolicy: async (policy: Partial<PasswordPolicy>): Promise<PasswordPolicy> => {
    const response = await apiPut<{ message: string; policy: PasswordPolicy }>('/admin/password-policy/', policy);
    return response.policy;
  },

  // Bulk operations
  bulkActivateUsers: async (userIds: string[]): Promise<{ message: string; updated_count: number }> => {
    return await apiPost<{ message: string; updated_count: number }>('/admin/users/bulk-activate/', {
      user_ids: userIds
    });
  },

  bulkDeactivateUsers: async (userIds: string[]): Promise<{ message: string; updated_count: number }> => {
    return await apiPost<{ message: string; updated_count: number }>('/admin/users/bulk-deactivate/', {
      user_ids: userIds
    });
  },

  bulkDeleteUsers: async (userIds: string[]): Promise<{ message: string; deleted_count: number }> => {
    return await apiPost<{ message: string; deleted_count: number }>('/admin/users/bulk-delete/', {
      user_ids: userIds
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (userId: string): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>(`/admin/users/${userId}/send-password-reset/`);
  },

  // Force password change on next login
  forcePasswordChange: async (userId: string): Promise<{ message: string }> => {
    return await apiPost<{ message: string }>(`/admin/users/${userId}/force-password-change/`);
  },

  // Re-export auth service methods for convenience
  getAllUsers: authService.getAllUsers,
  updateUserRole: authService.updateUserRole,
};
