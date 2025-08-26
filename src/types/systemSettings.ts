
export interface SystemSettingsResponse {
  site_name: string;
  maintenance_mode: boolean;
  max_file_size: number;
  allowed_file_types: string[];
  session_timeout: number;
}

export interface NotificationSettingsResponse {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: string;
}

export interface BackupSettingsResponse {
  auto_backup: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  backup_location: string;
}
