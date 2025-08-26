import { authService } from './authService';
import { apiGet, apiPost, apiPut, apiDelete, API_CONFIG } from '../utils/api';
import type { 
  AdminUser, 
  CreateUserData, 
  UpdateUserData, 
  UserQueryParams, 
  UserStats, 
  UserListResponse,
  ActivityLogEntry,
  PasswordPolicy
} from '../types/userManagement';

// Re-export types for component convenience
export type { 
  AdminUser, 
  CreateUserData, 
  UpdateUserData, 
  UserQueryParams, 
  UserStats, 
  UserListResponse,
  ActivityLogEntry,
  PasswordPolicy
};

/**
 * User Management Service
 * Handles all user-related operations for administrators
 * Includes CRUD operations, user statistics, activity tracking, and password policies
 */

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
