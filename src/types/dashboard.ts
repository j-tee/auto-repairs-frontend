import type { AppointmentStats } from "./appointments";
import type { CustomerStats } from "./customers";
import type { RepairOrderStats } from "./repairOrders";
import type { ShopStats } from "./shops";

// Dashboard Statistics Types
export interface DashboardStats {
  // Overview stats
  todaysAppointments: number;
  activeRepairs: number;
  totalCustomers: number;
  todaysRevenue: number;
  
  // This month stats
  monthlyAppointments: number;
  monthlyRevenue: number;
  monthlyNewCustomers: number;
  
  // Customer stats for customer role
  customerVehicles?: number;
  customerActiveAppointments?: number;
  customerRepairOrders?: number;
  customerTotalSpent?: number;
  
  // Detailed breakdown
  appointments?: AppointmentStats;
  customers?: CustomerStats;
  repairOrders?: RepairOrderStats;
  shop?: ShopStats;
}

export interface DashboardSummary {
  role: 'customer' | 'employee' | 'owner';
  stats: DashboardStats;
  lastUpdated: string;
  ////////////////////////////////
  todaysAppointments?: number;
  activeRepairOrders?: number;
  pendingApprovals?: number;
  completedToday?: number;
  totalRevenue?: number;
  averageRepairTime?: number;
  customerSatisfaction?: number;
  techniciansWorking?: number;
}