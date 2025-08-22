import { appointmentMngtService, type AppointmentStats } from './appointmentMngtService';
import { customerMngtService, type CustomerStats } from './customerMngtService';
import { repairOrderMngtService, type RepairOrderStats } from './repairOrderMngtService';
import { shopMngtService, type ShopStats } from './shopMngtService';

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
}

// Dashboard Management Service
export const dashboardService = {
  
  // Get comprehensive dashboard statistics based on user role
  getDashboardStats: async (userRole: string, userId?: string): Promise<DashboardSummary> => {
    try {
      const stats: DashboardStats = {
        todaysAppointments: 0,
        activeRepairs: 0,
        totalCustomers: 0,
        todaysRevenue: 0,
        monthlyAppointments: 0,
        monthlyRevenue: 0,
        monthlyNewCustomers: 0
      };

      if (userRole === 'customer') {
        // Customer-specific statistics
        if (userId) {
          try {
            // Get customer appointments
            const appointmentResponse = await appointmentMngtService.getAppointments({
              customerId: userId,
              limit: 100
            });
            
            // Get customer history for totals
            const customerHistory = await customerMngtService.getCustomerHistory(userId);
            
            stats.customerVehicles = customerHistory.vehicles?.length || 0;
            stats.customerActiveAppointments = appointmentResponse.appointments.filter(
              apt => ['scheduled', 'confirmed', 'in_progress'].includes(apt.status)
            ).length;
            stats.customerRepairOrders = customerHistory.repairOrders?.length || 0;
            stats.customerTotalSpent = customerHistory.totalSpent || 0;
            
          } catch (error) {
            console.warn('Error fetching customer-specific stats:', error);
            // Provide defaults if API calls fail
            stats.customerVehicles = 0;
            stats.customerActiveAppointments = 0;
            stats.customerRepairOrders = 0;
            stats.customerTotalSpent = 0;
          }
        }
        
      } else {
        // Employee/Owner statistics - fetch from all services
        try {
          // Get appointment statistics
          const appointmentStats = await appointmentMngtService.getAppointmentStats();
          stats.todaysAppointments = appointmentStats.todaysAppointments;
          stats.monthlyAppointments = appointmentStats.completedThisMonth;
          stats.appointments = appointmentStats;
          
        } catch (error) {
          console.warn('Error fetching appointment stats:', error);
          stats.todaysAppointments = 0;
          stats.monthlyAppointments = 0;
        }

        try {
          // Get repair order statistics
          const repairStats = await repairOrderMngtService.getRepairOrderStats();
          stats.activeRepairs = repairStats.activeOrders;
          stats.todaysRevenue = repairStats.totalRevenueThisMonth / 30; // Rough daily average
          stats.monthlyRevenue = repairStats.totalRevenueThisMonth;
          stats.repairOrders = repairStats;
          
        } catch (error) {
          console.warn('Error fetching repair order stats:', error);
          stats.activeRepairs = 0;
          stats.todaysRevenue = 0;
          stats.monthlyRevenue = 0;
        }

        try {
          // Get customer statistics
          const customerStats = await customerMngtService.getCustomerStats();
          stats.totalCustomers = customerStats.totalCustomers;
          stats.monthlyNewCustomers = customerStats.newCustomersThisMonth;
          stats.customers = customerStats;
          
        } catch (error) {
          console.warn('Error fetching customer stats:', error);
          stats.totalCustomers = 0;
          stats.monthlyNewCustomers = 0;
        }

        try {
          // Get shop statistics (if available)
          const shopStats = await shopMngtService.getShopStats();
          stats.shop = shopStats;
          
        } catch (error) {
          console.warn('Error fetching shop stats:', error);
        }
      }

      return {
        role: userRole as 'customer' | 'employee' | 'owner',
        stats,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  // Get today's appointments count
  getTodaysAppointmentsCount: async (): Promise<number> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentMngtService.getAppointments({
        dateFrom: today,
        dateTo: today,
        limit: 1 // We only need the count
      });
      return response.total;
    } catch (error) {
      console.warn('Error fetching today\'s appointments count:', error);
      return 0;
    }
  },

  // Get active repairs count
  getActiveRepairsCount: async (): Promise<number> => {
    try {
      const response = await repairOrderMngtService.getRepairOrders({
        status: 'in_progress',
        limit: 1 // We only need the count
      });
      return response.total;
    } catch (error) {
      console.warn('Error fetching active repairs count:', error);
      return 0;
    }
  },

  // Get total customers count
  getTotalCustomersCount: async (): Promise<number> => {
    try {
      const response = await customerMngtService.getCustomers({
        limit: 1 // We only need the count
      });
      return response.total;
    } catch (error) {
      console.warn('Error fetching customers count:', error);
      return 0;
    }
  },

  // Get today's revenue (from completed repair orders)
  getTodaysRevenue: async (): Promise<number> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await repairOrderMngtService.getRepairOrders({
        status: 'completed',
        dateFrom: today,
        dateTo: today,
        limit: 100 // Get all today's completed orders
      });
      
      return response.repairOrders.reduce((total, order) => {
        return total + (order.total || 0);
      }, 0);
    } catch (error) {
      console.warn('Error fetching today\'s revenue:', error);
      return 0;
    }
  }
};
