import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// User types
export interface AdminUser {
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
  permissions?: string[];
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminUser['role'];
  phone?: string;
  address?: string;
  permissions?: string[];
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: AdminUser['role'];
  phone?: string;
  address?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminUser['role'];
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    owner: number;
    employee: number;
    customer: number;
  };
  recentUsers: AdminUser[];
}

// User Management Service
export const userMngtService = {
  // Get all users with filtering and pagination
  getUsers: async (query: UserQuery = {}): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.role) params.append('role', query.role);
    if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);
    
    const queryString = params.toString();
    const endpoint = `/admin/users/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    
    return {
      users: response.results?.map((user: any) => ({
        id: user.id?.toString() || '',
        email: user.email || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'customer',
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isActive: user.is_active ?? true,
        createdAt: user.date_joined || new Date().toISOString(),
        lastLogin: user.last_login,
        permissions: user.permissions || []
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiGet<any>(`/admin/users/${userId}/`);
    
    return {
      id: response.id?.toString() || '',
      email: response.email || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      role: response.role || 'customer',
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions || []
    };
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<AdminUser> => {
    const createData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      permissions: userData.permissions || []
    };
    
    const response = await apiPost<any>('/admin/users/', createData);
    
    return {
      id: response.id?.toString() || '',
      email: response.email || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      role: response.role || 'customer',
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions || []
    };
  },

  // Update user
  updateUser: async (userId: string, userData: UpdateUserData): Promise<AdminUser> => {
    const updateData = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      is_active: userData.isActive,
      permissions: userData.permissions
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/admin/users/${userId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      email: response.email || '',
      firstName: response.first_name || '',
      lastName: response.last_name || '',
      role: response.role || 'customer',
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions || []
    };
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await apiDelete(`/admin/users/${userId}/`);
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<AdminUser> => {
    return await userMngtService.updateUser(userId, { isActive: false });
  },

  // Activate user
  activateUser: async (userId: string): Promise<AdminUser> => {
    return await userMngtService.updateUser(userId, { isActive: true });
  },

  // Reset user password
  resetUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiPost(`/admin/users/${userId}/reset-password/`, { password: newPassword });
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiGet<any>('/admin/users/stats/');
    
    return {
      totalUsers: response.total_users || 0,
      activeUsers: response.active_users || 0,
      inactiveUsers: response.inactive_users || 0,
      usersByRole: {
        owner: response.users_by_role?.owner || 0,
        employee: response.users_by_role?.employee || 0,
        customer: response.users_by_role?.customer || 0
      },
      recentUsers: response.recent_users?.map((user: any) => ({
        id: user.id?.toString() || '',
        email: user.email || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'customer',
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isActive: user.is_active ?? true,
        createdAt: user.date_joined || new Date().toISOString(),
        lastLogin: user.last_login,
        permissions: user.permissions || []
      })) || []
    };
  },

  // Search users
  searchUsers: async (searchTerm: string, options: { role?: AdminUser['role']; limit?: number } = {}): Promise<AdminUser[]> => {
    const query: UserQuery = {
      search: searchTerm,
      limit: options.limit || 10
    };
    
    if (options.role) {
      query.role = options.role;
    }
    
    const response = await userMngtService.getUsers(query);
    return response.users;
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds: string[], updateData: UpdateUserData): Promise<AdminUser[]> => {
    const response = await apiPost<any>('/admin/users/bulk-update/', {
      user_ids: userIds,
      update_data: {
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        role: updateData.role,
        phone: updateData.phone,
        address: updateData.address,
        is_active: updateData.isActive,
        permissions: updateData.permissions
      }
    });
    
    return response.updated_users?.map((user: any) => ({
      id: user.id?.toString() || '',
      email: user.email || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role || 'customer',
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      isActive: user.is_active ?? true,
      createdAt: user.date_joined || new Date().toISOString(),
      lastLogin: user.last_login,
      permissions: user.permissions || []
    })) || [];
  },

  // Get user activity log
  getUserActivityLog: async (userId: string, options: { page?: number; limit?: number } = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/admin/users/${userId}/activity/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    return response.results || [];
  }
};
