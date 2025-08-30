import { toast } from "react-toastify";
import type {
  AdminUser,
  CreateUserData,
  PasswordPolicy,
  UpdateUserData,
  UserExportFileData,
  UserExportMetadata,
  UserExportResponse,
  UserListResponse,
  UserQuery,
  UserResponse,
  UserStats,
  UserStatsResponse,
} from "../types/userManagement";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import type { PasswordPolicyResponse } from "../types/auth";
import type { BackupSettings, ManualBackUpTrigger, SystemNotification } from "../types/autoRepairs";
// import type { User } from "./authService";

// User types
// export interface AdminUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: 'owner' | 'employee' | 'customer';
//   avatar?: string;
//   phone?: string;
//   address?: string;
//   isActive: boolean;
//   createdAt: string;
//   lastLogin?: string;
//   permissions?: string[];

//   // Extended properties for admin management
//   department?: string;
//   employeeId?: string;
//   hireDate?: string;
//   salary?: number;
//   manager?: string;
//   notes?: string;
//   loginAttempts?: number;
//   lastPasswordChange?: string;
//   passwordExpiresAt?: string;
//   twoFactorEnabled?: boolean;
//   shopId?: string; // For employees - which shop they work at
//   shopName?: string; // For display purposes
// }

// export interface CreateUserData {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   role: AdminUser['role'];
//   phone?: string;
//   address?: string;
//   permissions?: string[];
// }

// export interface UpdateUserData {
//   email?: string;
//   firstName?: string;
//   lastName?: string;
//   role?: AdminUser['role'];
//   phone?: string;
//   address?: string;
//   isActive?: boolean;
//   permissions?: string[];
// }

// export interface UserQuery {
//   page?: number;
//   limit?: number;
//   search?: string;
//   role?: AdminUser['role'];
//   isActive?: boolean;
//   sortBy?: string;
//   sortOrder?: 'asc' | 'desc';
// }

// User Management Service
export const userMngtService = {
  // Get all users with filtering and pagination
  // Export users (CSV or other format)
  // exportUsers: async (query: UserQuery = {}) => {
  //   const params = new URLSearchParams();
  //   if (query.page) params.append('page', query.page.toString());
  //   if (query.limit) params.append('limit', query.limit.toString());
  //   if (query.search) params.append('search', query.search);
  //   if (query.role) params.append('role', query.role);
  //   if (query.isActive !== undefined) params.append('is_active', query.isActive.toString());
  //   if (query.sortBy) params.append('sort_by', query.sortBy);
  //   if (query.sortOrder) params.append('sort_order', query.sortOrder);

  //   const queryString = params.toString();
  //   const endpoint = `/admin/users/export/${queryString ? `?${queryString}` : ''}`;
  //   return await apiGet<UserExportResponse>(endpoint);
  // },
  exportUsers: async (query: UserQuery = {}): Promise<UserExportResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.role) params.append("role", query.role);
    if (query.isActive !== undefined)
      params.append("is_active", query.isActive.toString());
    if (query.sortBy) params.append("sort_by", query.sortBy);
    if (query.sortOrder) params.append("sort_order", query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/admin/users/export/${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      // First, try to get the response to check content type
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type") || "";

      // Scenario 1: Backend returns file data directly
      if (
        contentType.includes("text/csv") ||
        contentType.includes("application/vnd.openxmlformats") ||
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
      ) {
        const blob = await response.blob();
        const filename =
          response.headers
            .get("Content-Disposition")
            ?.split("filename=")[1]
            ?.replace(/"/g, "") || "users_export.csv";

        return {
          data: blob,
          filename,
          contentType,
          size: blob.size,
          recordCount: parseInt(
            response.headers.get("X-Record-Count") || "0",
            10
          ),
        } as UserExportFileData;
      }

      // Scenario 2: Backend returns metadata/download URL
      else if (contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        return {
          success: jsonResponse.success ?? true,
          filename: jsonResponse.filename || "users_export.csv",
          format: jsonResponse.format || "csv",
          downloadUrl: jsonResponse.downloadUrl || jsonResponse.download_url,
          recordCount:
            jsonResponse.recordCount || jsonResponse.record_count || 0,
          exportId: jsonResponse.exportId || jsonResponse.export_id,
          createdAt:
            jsonResponse.createdAt ||
            jsonResponse.created_at ||
            new Date().toISOString(),
          expiresAt: jsonResponse.expiresAt || jsonResponse.expires_at,
          fileSize: jsonResponse.fileSize || jsonResponse.file_size,
          message: jsonResponse.message,
        } as UserExportMetadata;
      }

      // Fallback: Treat as JSON metadata
      else {
        const textResponse = await response.text();
        return {
          success: true,
          filename: "users_export.csv",
          format: "csv",
          recordCount: 0,
          createdAt: new Date().toISOString(),
          message: textResponse || "Export completed",
        } as UserExportMetadata;
      }
    } catch (error) {
      toast('Error exporting users: ' + (error instanceof Error ? error.message : 'Unknown error'), { type: 'error' });
      // Always return a fallback UserExportMetadata object on error
      return {
        success: false,
        filename: "users_export.csv",
        format: "csv",
        recordCount: 0,
        createdAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error"
      } as UserExportMetadata;
    }
  },
  getUsers: async (query: UserQuery = {}): Promise<UserListResponse> => {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.role) params.append("role", query.role);
    if (query.isActive !== undefined)
      params.append("is_active", query.isActive.toString());
    if (query.sortBy) params.append("sort_by", query.sortBy);
    if (query.sortOrder) params.append("sort_order", query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/admin/users/${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<UserListResponse>(endpoint);

    // Handle different response formats
    let users, total, actualPage, actualLimit, actualTotalPages;

    if (Array.isArray(response)) {
      // Direct array response
      users = response;
      total = response.length;
      actualPage = query.page || 1;
      actualLimit = query.limit || 20;
      actualTotalPages = 1;
    } else if (response.results) {
      // Django REST Framework pagination format
      users = response.results;
      total = response.count || 0;
      actualPage = query.page || 1;
      actualLimit = query.limit || 20;
      actualTotalPages = Math.ceil(total / actualLimit);
    } else {
      // Other possible formats
      users = response.users || response.data || [];
      total = response.total || response.count || users.length;
      actualPage = response.page || query.page || 1;
      actualLimit = response.limit || query.limit || 20;
      actualTotalPages =
        response.totalPages ||
        response.total_pages ||
        Math.ceil(total / actualLimit);
    }

    return {
      users: users.map((user: UserResponse) => ({
        id: user.id?.toString() || "",
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        role: user.role || "customer",
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isActive: user.is_active ?? true,
        createdAt: user.date_joined || new Date().toISOString(),
        lastLogin: user.last_login,
        permissions: user.permissions,
      })),
      total: total,
      page: actualPage,
      limit: actualLimit,
      totalPages: actualTotalPages,
    };
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiGet<UserResponse>(`/admin/users/${userId}/`);

    return {
      id: response.id?.toString() || "",
      email: response.email || "",
      firstName: response.first_name || "",
      lastName: response.last_name || "",
      role: response.role || "customer",
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions,
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
      permissions: userData.permissions || [],
    };

    const response = await apiPost<UserResponse>("/admin/users/", createData);

    return {
      id: response.id?.toString() || "",
      email: response.email || "",
      firstName: response.first_name || "",
      lastName: response.last_name || "",
      role: response.role || "customer",
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions ,
    };
  },

  // Update user
  updateUser: async (
    userId: string,
    userData: UpdateUserData
  ): Promise<AdminUser> => {
    const updateData = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      is_active: userData.isActive,
      permissions: userData.permissions,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const response = await apiPut<UserResponse>(`/admin/users/${userId}/`, updateData);

    return {
      id: response.id?.toString() || "",
      email: response.email || "",
      firstName: response.first_name || "",
      lastName: response.last_name || "",
      role: response.role || "customer",
      avatar: response.avatar,
      phone: response.phone,
      address: response.address,
      isActive: response.is_active ?? true,
      createdAt: response.date_joined || new Date().toISOString(),
      lastLogin: response.last_login,
      permissions: response.permissions,
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
  resetUserPassword: async (
    userId: string,
    newPassword: string
  ): Promise<void> => {
    await apiPost(`/admin/users/${userId}/reset-password/`, {
      password: newPassword,
    });
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiGet<UserStatsResponse>("/admin/users/stats/");

    // Calculate active/inactive based on account status, not recent activity
    const totalUsers = response.total_users || 0;
    const activeUsers =
      response.user_status?.active_users ||
      response.activity?.active_users_30_days ||
      0;
    const inactiveUsers =
      response.user_status?.inactive_users || totalUsers - activeUsers;

    return {
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      inactiveUsers: inactiveUsers,
      usersByRole: {
        owner: response.role_distribution?.counts?.owners || 0,
        employee: response.role_distribution?.counts?.employees || 0,
        customer: response.role_distribution?.counts?.customers || 0,
      },
      recentUsers:
        response.recent_users?.map((user: UserResponse) => ({
          id: user.id?.toString() || "",
          email: user.email || "",
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          role: user.role || "customer",
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          isActive: user.is_active ?? true,
          createdAt: user.date_joined || new Date().toISOString(),
          lastLogin: user.last_login,
          permissions: user.permissions,
        })) || [],
    };
  },

  // Search users
  searchUsers: async (
    searchTerm: string,
    options: { role?: AdminUser["role"]; limit?: number } = {}
  ): Promise<AdminUser[]> => {
    const query: UserQuery = {
      search: searchTerm,
      limit: options.limit || 10,
    };

    if (options.role) {
      query.role = options.role;
    }

    const response = await userMngtService.getUsers(query);
    return response.users;
  },

  // Bulk update users
  bulkUpdateUsers: async (
    userIds: string[],
    updateData: UpdateUserData
  ): Promise<AdminUser[]> => {
    const response = await apiPost<UserResponse>("/admin/users/bulk-update/", {
      user_ids: userIds,
      update_data: {
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        role: updateData.role,
        phone: updateData.phone,
        address: updateData.address,
        is_active: updateData.isActive,
        permissions: updateData.permissions,
      },
    });

    return (
      response.updated_users?.map((user: UserResponse) => ({
        id: user.id?.toString() || "",
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        role: user.role || "customer",
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isActive: user.is_active ?? true,
        createdAt: user.date_joined || new Date().toISOString(),
        lastLogin: user.last_login,
        permissions: user.permissions,
      })) || []
    );
  },

  // Get user activity log
  getUserActivityLog: async (
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<unknown[]> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const endpoint = `/admin/users/${userId}/activity/${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiGet<unknown>(endpoint);
    if (response && typeof response === "object" && "results" in response) {
      return (response as { results: unknown[] }).results || [];
    }
    return [];
  },

  // Password Policy and System Settings Functions
  // Get password policy settings
  getPasswordPolicy: async (): Promise<PasswordPolicy> => {
    try {
      const response = await apiGet<PasswordPolicyResponse>("/admin/settings/password-policy/");
      return {
        minLength: response.min_length || 8,
        requireUppercase: response.require_uppercase ?? true,
        requireLowercase: response.require_lowercase ?? true,
        requireNumbers: response.require_numbers ?? true,
        requireSpecialChars: response.require_special_chars ?? true,
        passwordExpiry: response.password_expiry || 90,
        preventReuse: response.prevent_reuse || 5,
      };
    } catch (error) {
      toast('Error fetching password policy: ' + (error instanceof Error ? error.message : 'Unknown error'), { type: 'error' });
      // Return default policy if API call fails
      return {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiry: 90,
        preventReuse: 5,
      };
    }
  },

  // Update password policy settings
  updatePasswordPolicy: async (policy: PasswordPolicy): Promise<void> => {
    const updateData = {
      min_length: policy.minLength,
      require_uppercase: policy.requireUppercase,
      require_lowercase: policy.requireLowercase,
      require_numbers: policy.requireNumbers,
      require_special_chars: policy.requireSpecialChars,
      password_expiry: policy.passwordExpiry,
      prevent_reuse: policy.preventReuse,
    };

    await apiPut("/admin/settings/password-policy/", updateData);
  },

  // Get system settings
  getSystemSettings: async (): Promise<unknown> => {
    try {
      const response = await apiGet<unknown>("/admin/settings/system/");
      return response;
    } catch (error) {
      toast('Error fetching system settings: ' + (error instanceof Error ? error.message : 'Unknown error'), { type: 'error' });
      return {};
    }
  },

  // Update system settings
  updateSystemSettings: async (settings: unknown): Promise<void> => {
    await apiPut("/admin/settings/system/", settings);
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<SystemNotification> => {
    try {
      const response = await apiGet<SystemNotification>("/admin/settings/notifications/");
      return response;
    } catch (error) {
      toast('Error fetching notification settings: ' + (error instanceof Error ? error.message : 'Unknown error'), { type: 'error' });
      return {
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        maintenanceAlerts: true,
        systemUpdates: true,
      };
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings: SystemNotification): Promise<void> => {
    await apiPut("/admin/settings/notifications/", settings);
  },

  // Get backup settings
  getBackupSettings: async (): Promise<BackupSettings> => {
    try {
      const response = await apiGet<BackupSettings>("/admin/settings/backup/");
      return response;
    } catch (error) {
      toast('Error fetching backup settings: ' + (error instanceof Error ? error.message : 'Unknown error'), { type: 'error' });
      return {
        autoBackup: true,
        backupFrequency: "daily",
        retentionPeriod: 30,
        backupLocation: "cloud",
      };
    }
  },

  // Update backup settings
  updateBackupSettings: async (settings: BackupSettings): Promise<void> => {
    await apiPut("/admin/settings/backup/", settings);
  },

  // Trigger manual backup
  triggerBackup: async (): Promise<ManualBackUpTrigger> => {
    try {
      const response = await apiPost<ManualBackUpTrigger>("/admin/backup/trigger/", {});
      return {
        success: true,
        message: response.message || "Backup initiated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Backup failed",
      };
    }
  },
};
