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
  dateJoined?: string;
  permissions?: Permissions;
}

export interface UserResponse {
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'owner' | 'employee' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  createdAt?: string;
  last_login?: string;
  date_joined?: string;
  permissions?: Permissions;
} 
// Extended user interface for admin management
export interface Permissions{
 can_manage_shops: boolean;
    can_view_financial_data: boolean;
    can_manage_inventory: boolean;
    can_manage_employees: boolean;
    is_owner: boolean;
    is_employee: boolean;
    is_customer: boolean;
}
export interface AdminUser extends User {
  department?: string;
  employeeId?: string;
  hireDate?: string;
  salary?: number;
  manager?: string;
  notes?: string;
  loginAttempts?: number;
  lastPasswordChange?: string;
  passwordExpiresAt?: string;
  twoFactorEnabled?: boolean;
  shopId?: string; // For employees - which shop they work at
  shopName?: string; // For display purposes
 
}

export interface UserResponse {
  updated_users?: User[];
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'owner' | 'employee' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  createdAt?: string;
  last_login?: string;
  date_joined?: string;
  permissions?: Permissions;
}
// User creation form data for admins
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  phone?: string;
  address?: string;
  department?: string;
  employeeId?: string;
  hireDate?: string;
  manager?: string;
  notes?: string;
  isActive: boolean;
  sendWelcomeEmail: boolean;
  temporaryPassword?: string;
    password: string;
    permissions?: {
    can_manage_shops: boolean;
    can_view_financial_data: boolean;
    can_manage_inventory: boolean;
    can_manage_employees: boolean;
    is_owner: boolean;
    is_employee: boolean;
    is_customer: boolean;
  };
}

// User update data
export interface UpdateUserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: User['role'];
  phone?: string;
  address?: string;
  department?: string;
  employeeId?: string;
  hireDate?: string;
  manager?: string;
  notes?: string;
  isActive?: boolean;
  permissions?: string[];
}

// User search and filter criteria
export interface UserSearchCriteria {
  searchTerm?: string;
  role?: User['role'] | 'all';
  department?: string;
  isActive?: boolean | 'all';
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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
// User statistics for dashboard
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  ownerUsers: number;
  employeeUsers: number;
  customerUsers: number;
  recentRegistrations: number;
  usersLoggedInToday: number;
  passwordExpiringSoon: number;
}

export interface UserStatsResponse {
  recent_users: AdminUser[];
  total_users: number;
  active_users: number;
  user_status: {
    active_users: number;
    inactive_users: number;
  };
  role_distribution: {
    counts: {
      owners: number;
      employees: number;
      customers: number;
    }
  }
  activity:{
    active_users_30_days: number;
  }
  users_by_role: {
    owner: number;
    employee: number;
    customer: number;
  };
  recent_registrations: number;
  users_logged_in_today: number;
  password_expiring_soon: number;
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
export interface UserListResponse {
  results?: AdminUser[];
  count?: number;
  data?: AdminUser[];
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  total_pages?: number;
}
// User activity log
export interface UserActivityLog {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'password_change' | 'profile_update' | 'role_change' | 'activation' | 'deactivation';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  performedBy?: string; // Admin who performed the action
}

// Bulk operations
export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'reset_password' | 'change_role';
  newRole?: User['role']; // For role changes
  sendNotification?: boolean;
}

// Password policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiry: number; // days
  preventReuse: number; // number of previous passwords to check
}

// User session information
export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  location?: string;
  device?: string;
  isActive: boolean;
}
// Add these interfaces at the top of your userMngtService.ts file

export interface UserExportMetadata {
  success: boolean;
  filename: string;
  format: 'csv' | 'excel' | 'pdf';
  downloadUrl?: string;
  recordCount: number;
  exportId?: string;
  createdAt: string;
  expiresAt?: string;
  fileSize?: number;
  message?: string;
}

export interface UserExportFileData {
  data: Blob;
  filename: string;
  contentType: string;
  size: number;
  recordCount: number;
}

// Union type for the service method
export type UserExportResponse = UserExportMetadata | UserExportFileData;

// Type guard functions
export const isExportMetadata = (response: UserExportResponse): response is UserExportMetadata => {
  return 'success' in response && 'downloadUrl' in response;
};

export const isExportFileData = (response: UserExportResponse): response is UserExportFileData => {
  return 'data' in response && response.data instanceof Blob;
};