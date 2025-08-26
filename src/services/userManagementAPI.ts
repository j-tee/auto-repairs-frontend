import { apiGet, apiPut, apiPost } from '../utils/api';
import type { PasswordPolicy } from '../types/userManagement';

export const UserManagementAPI = {
  // Get password policy settings
  getPasswordPolicy: async (): Promise<PasswordPolicy> => {
    try {
      const response = await apiGet<unknown>('/admin/settings/password-policy/');
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

    await apiPut('/admin/settings/password-policy/', updateData);
  },

  // Get system settings
  getSystemSettings: async (): Promise<unknown> => {
    try {
      const response = await apiGet<unknown>('/admin/settings/system/');
      return response;
    } catch (error) {
      return {};
    }
  },

  // Update system settings
  updateSystemSettings: async (settings: unknown): Promise<void> => {
    await apiPut('/admin/settings/system/', settings);
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<unknown> => {
    try {
      const response = await apiGet<unknown>('/admin/settings/notifications/');
      return response;
    } catch (error) {
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
  updateNotificationSettings: async (settings: unknown): Promise<void> => {
    await apiPut('/admin/settings/notifications/', settings);
  },

  // Get backup settings
  getBackupSettings: async (): Promise<unknown> => {
    try {
      const response = await apiGet<unknown>('/admin/settings/backup/');
      return response;
    } catch (error) {
      return {
        autoBackup: true,
        backupFrequency: 'daily',
        retentionPeriod: 30,
        backupLocation: 'cloud',
      };
    }
  },

  // Update backup settings
  updateBackupSettings: async (settings: unknown): Promise<void> => {
    await apiPut('/admin/settings/backup/', settings);
  },

  // Trigger manual backup
  triggerBackup: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiPost<unknown>('/admin/backup/trigger/', {});
      return {
        success: true,
        message: response.message || 'Backup initiated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Backup failed',
      };
    }
  },
};