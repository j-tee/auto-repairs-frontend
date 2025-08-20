import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import type { 
  AdminUser, 
  CreateUserData, 
  UpdateUserData, 
  UserSearchCriteria, 
  UserStatistics, 
  UserActivityLog, 
  BulkUserOperation,
  UserSession,
  PasswordPolicy
} from '../types/userManagement';

export class UserManagementAPI {
  
  // Get all users with optional filtering
  static async getUsers(criteria?: UserSearchCriteria): Promise<{
    users: AdminUser[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    
    if (criteria) {
      if (criteria.searchTerm) params.append('search', criteria.searchTerm);
      if (criteria.role && criteria.role !== 'all') params.append('role', criteria.role);
      if (criteria.department) params.append('department', criteria.department);
      if (criteria.isActive !== undefined && criteria.isActive !== 'all') {
        params.append('is_active', criteria.isActive.toString());
      }
      if (criteria.createdAfter) params.append('created_after', criteria.createdAfter);
      if (criteria.createdBefore) params.append('created_before', criteria.createdBefore);
      if (criteria.sortBy) params.append('sort_by', criteria.sortBy);
      if (criteria.sortOrder) params.append('sort_order', criteria.sortOrder);
      if (criteria.page) params.append('page', criteria.page.toString());
      if (criteria.limit) params.append('limit', criteria.limit.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiGet<{
      users: AdminUser[];
      totalCount: number;
      pageCount: number;
      currentPage: number;
    }>(`/admin/users${query}`);
  }

  // Get a specific user by ID
  static async getUser(userId: string): Promise<AdminUser> {
    return apiGet<AdminUser>(`/admin/users/${userId}`);
  }

  // Create a new user
  static async createUser(userData: CreateUserData): Promise<AdminUser> {
    return apiPost<AdminUser>('/admin/users', userData);
  }

  // Update an existing user
  static async updateUser(userData: UpdateUserData): Promise<AdminUser> {
    return apiPut<AdminUser>(`/admin/users/${userData.id}`, userData);
  }

  // Delete a user
  static async deleteUser(userId: string): Promise<void> {
    return apiDelete(`/admin/users/${userId}`);
  }

  // Activate/Deactivate user
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
    return apiPut<AdminUser>(`/admin/users/${userId}/status`, { isActive });
  }

  // Reset user password
  static async resetUserPassword(userId: string, sendEmail: boolean = true): Promise<{ temporaryPassword: string }> {
    return apiPost<{ temporaryPassword: string }>(`/admin/users/${userId}/reset-password`, { sendEmail });
  }

  // Force password change on next login
  static async forcePasswordChange(userId: string): Promise<void> {
    return apiPost(`/admin/users/${userId}/force-password-change`);
  }

  // Get user statistics
  static async getUserStatistics(): Promise<UserStatistics> {
    return apiGet<UserStatistics>('/admin/users/statistics');
  }

  // Get user activity logs
  static async getUserActivityLogs(
    userId?: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{
    logs: UserActivityLog[];
    totalCount: number;
  }> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiGet<{
      logs: UserActivityLog[];
      totalCount: number;
    }>(`/admin/users/activity-logs?${params.toString()}`);
  }

  // Bulk operations on users
  static async bulkUserOperation(operation: BulkUserOperation): Promise<{
    success: string[];
    failed: Array<{ userId: string; error: string }>;
  }> {
    return apiPost<{
      success: string[];
      failed: Array<{ userId: string; error: string }>;
    }>('/admin/users/bulk-operations', operation);
  }

  // Get user sessions
  static async getUserSessions(userId?: string): Promise<UserSession[]> {
    const endpoint = userId ? `/admin/users/${userId}/sessions` : '/admin/users/sessions';
    return apiGet<UserSession[]>(endpoint);
  }

  // Terminate user session
  static async terminateUserSession(sessionId: string): Promise<void> {
    return apiDelete(`/admin/users/sessions/${sessionId}`);
  }

  // Get system password policy
  static async getPasswordPolicy(): Promise<PasswordPolicy> {
    return apiGet<PasswordPolicy>('/admin/users/password-policy');
  }

  // Update system password policy
  static async updatePasswordPolicy(policy: PasswordPolicy): Promise<PasswordPolicy> {
    return apiPut<PasswordPolicy>('/admin/users/password-policy', policy);
  }

  // Export users data
  static async exportUsers(format: 'csv' | 'excel' | 'pdf', criteria?: UserSearchCriteria): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (criteria) {
      if (criteria.searchTerm) params.append('search', criteria.searchTerm);
      if (criteria.role && criteria.role !== 'all') params.append('role', criteria.role);
      if (criteria.department) params.append('department', criteria.department);
      if (criteria.isActive !== undefined && criteria.isActive !== 'all') {
        params.append('is_active', criteria.isActive.toString());
      }
    }

    const response = await fetch(`/api/admin/users/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Send welcome email to user
  static async sendWelcomeEmail(userId: string, includePassword: boolean = false): Promise<void> {
    return apiPost(`/admin/users/${userId}/send-welcome-email`, { includePassword });
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    return apiGet<string[]>(`/admin/users/${userId}/permissions`);
  }

  // Update user permissions
  static async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    return apiPut(`/admin/users/${userId}/permissions`, { permissions });
  }

  // Unlock user account (if locked due to failed login attempts)
  static async unlockUserAccount(userId: string): Promise<void> {
    return apiPost(`/admin/users/${userId}/unlock`);
  }

  // Enable/Disable two-factor authentication for user
  static async toggleTwoFactorAuth(userId: string, enabled: boolean): Promise<void> {
    return apiPut(`/admin/users/${userId}/two-factor`, { enabled });
  }
}
