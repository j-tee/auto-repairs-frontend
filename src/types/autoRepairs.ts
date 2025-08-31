export interface SystemNotification{
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  maintenanceAlerts: boolean;
  systemUpdates: boolean;
}

export interface ManualBackUpTrigger{ success: boolean; message: string }
export interface BackupSettingsREsponse{
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  retention_period: number;
  backup_location: string;
}
 export interface BackupSettings{
 autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number;
  backupLocation: string;
 }
// Appointment types

// Repair Order types

// Legacy RepairJob type for backward compatibility


// Dashboard summary types
export interface DashboardSummary {
  todaysAppointments: number;
  activeRepairOrders: number;
  pendingApprovals: number;
  completedToday: number;
  totalRevenue: number;
  averageRepairTime: number;
  customerSatisfaction: number;
  techniciansWorking: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common utility types
export type EntityStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}
