/**
 * Dashboard Domain Types
 * Single source of truth for all dashboard-related type definitions
 */

import type { AppointmentStats } from "./appointments";
import type { RepairOrderStatsAPIResponse } from "./repairOrders";

// Core dashboard statistics interface
export interface DashboardStats {
  // Overview stats
  todaysAppointments: number;
  activeRepairs: number;
  totalCustomers: number;
  todaysRevenue: number;
  
  // This month stats
  monthlyAppointments?: number;
  monthlyRevenue?: number;
  monthlyNewCustomers?: number;
  
  // Customer-specific stats (for customer role)
  customerVehicles?: number;
  customerActiveAppointments?: number;
  customerRepairOrders?: number;
  customerTotalSpent?: number;
  
  // Optional role-specific stats
  customers?: CustomerStats;
  appointments?: AppointmentStats;
  repairOrders?: RepairOrderStatsAPIResponse;
  shop?: ShopStats;
}

// Main dashboard summary interface
export interface DashboardSummary {
  role: 'customer' | 'employee' | 'owner';
  stats: DashboardStats;
  lastUpdated: string;
}

// Customer-specific dashboard stats
export interface CustomerStats {
  totalVehicles: number;
  pendingAppointments: number;
  completedServices: number;
  totalSpent: number;
  lastServiceDate?: string;
  upcomingAppointments: number;
}

// Shop performance statistics
export interface ShopStats {
  id: string;
  name: string;
  totalTechnicians: number;
  activeTechnicians: number;
  averageRepairTime: number;
  customerSatisfactionScore: number;
  monthlyRevenue: number;
  completedRepairsThisMonth: number;
  pendingRepairs: number;
  capacityUtilization: number; // percentage
}

// Service category performance
export interface ServiceCategoryStats {
  id: string;
  name: string;
  totalServices: number;
  totalRevenue: number;
  averageCompletionTime: number;
  customerRating: number;
  popularityRank: number;
}

// Time-based analytics
export interface TimeBasedStats {
  daily: DailyStats[];
  weekly: WeeklyStats[];
  monthly: MonthlyStats[];
}

export interface DailyStats {
  date: string;
  appointments: number;
  completedServices: number;
  revenue: number;
  customerSatisfaction: number;
}

export interface WeeklyStats {
  weekStarting: string;
  totalAppointments: number;
  completedServices: number;
  totalRevenue: number;
  averageCustomerSatisfaction: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalAppointments: number;
  completedServices: number;
  totalRevenue: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
}

// Dashboard filter and query types
export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  shopId?: string;
  employeeId?: string;
  serviceCategory?: string;
  customerType?: 'new' | 'returning' | 'all';
}

export interface DashboardQuery {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  filters?: DashboardFilters;
  includeComparisons?: boolean;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// Real-time dashboard updates
export interface DashboardUpdate {
  timestamp: string;
  type: 'appointment' | 'repair_order' | 'customer' | 'revenue';
  action: 'created' | 'updated' | 'completed' | 'cancelled';
  entityId: string;
  summary: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// Dashboard widget configuration
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'list' | 'table' | 'calendar';
  title: string;
  dataSource: string;
  configuration: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  refreshInterval?: number; // in seconds
}

export interface DashboardLayout {
  id: string;
  name: string;
  role: 'customer' | 'employee' | 'owner' | 'admin';
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// KPI and metric types
export interface KPI {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  period: string;
  isGood: boolean; // whether current trend/value is positive
}

export interface MetricThresholds {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

// Dashboard notification types
export interface DashboardNotification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  relatedEntityType?: 'appointment' | 'repair_order' | 'customer' | 'vehicle';
  relatedEntityId?: string;
}
