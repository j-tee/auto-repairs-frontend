import type { User } from '../store/slices/autoRepairsSlice';

// Extended user interface for admin management
export interface AdminUser extends User {
  permissions?: {
    can_manage_shops: boolean;
    can_view_financial_data: boolean;
    can_manage_inventory: boolean;
    can_manage_employees: boolean;
    is_owner: boolean;
    is_employee: boolean;
    is_customer: boolean;
  };
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
}

// User update data
export interface UpdateUserData {
  id: string;
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
