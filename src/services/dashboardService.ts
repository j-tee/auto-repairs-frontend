import { appointmentMngtService, type AppointmentStats } from './appointmentMngtService';
import { customerMngtService, type CustomerStats } from './customerMngtService';
import { vehicleMngtService } from './vehicleMngtService';
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
              limit: 1000
            });
            
            // Get customer vehicles
            const vehiclesResponse = await vehicleMngtService.getVehicles({
              customerId: userId,
              limit: 1000
            });
            
            // Get customer repair orders
            const repairOrdersResponse = await repairOrderMngtService.getRepairOrders({
              customerId: userId,
              limit: 1000
            });
            
            stats.customerVehicles = vehiclesResponse.vehicles?.length || 0;
            stats.customerActiveAppointments = appointmentResponse.appointments.filter(
              apt => ['scheduled', 'confirmed', 'in_progress'].includes(apt.status)
            ).length;
            stats.customerRepairOrders = repairOrdersResponse.repairOrders?.length || 0;
            stats.customerTotalSpent = repairOrdersResponse.repairOrders?.reduce(
              (sum, order) => sum + (order.total || 0), 0
            ) || 0;
            
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
          // Get appointment statistics - Use existing appointments endpoint
          const appointmentsResponse = await appointmentMngtService.getAppointments({ limit: 1000 });
          const appointments = appointmentsResponse.appointments;
          
          // Calculate today's appointments
          const today = new Date().toISOString().split('T')[0];
          stats.todaysAppointments = appointments.filter(apt => 
            apt.scheduledDate === today
          ).length;
          
          // Calculate monthly appointments (completed this month)
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          stats.monthlyAppointments = appointments.filter(apt => 
            apt.scheduledDate.startsWith(thisMonth) && apt.status === 'completed'
          ).length;
          
        } catch (error) {
          console.warn('Error fetching appointment stats:', error);
          stats.todaysAppointments = 0;
          stats.monthlyAppointments = 0;
        }

        try {
          // Get repair order statistics using the new backend active endpoint
          const activeRepairs = await repairOrderMngtService.getActiveRepairOrders();
          
          // Calculate active repairs count (backend already filters for us)
          stats.activeRepairs = activeRepairs.length;
          
          // Calculate today's revenue from active repairs created today
          const today = new Date().toISOString().split('T')[0];
          const todaysActiveRepairs = activeRepairs.filter(order => 
            order.createdAt?.startsWith(today)
          );
          stats.todaysRevenue = todaysActiveRepairs.reduce((sum, order) => sum + (order.total || 0), 0);
          
          // Calculate monthly revenue from active repairs
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          const monthlyActiveRepairs = activeRepairs.filter(order => 
            order.createdAt?.startsWith(thisMonth)
          );
          stats.monthlyRevenue = monthlyActiveRepairs.reduce((sum, order) => sum + (order.total || 0), 0);
          
        } catch (error) {
          console.warn('Error fetching repair order stats:', error);
          stats.activeRepairs = 0;
          stats.todaysRevenue = 0;
          stats.monthlyRevenue = 0;
        }

        try {
          // Get customer statistics - Use existing customers endpoint
          const customersResponse = await customerMngtService.getCustomers({ limit: 1000 });
          const customers = customersResponse.customers;
          
          stats.totalCustomers = customers.length;
          
          // Calculate new customers this month
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          stats.monthlyNewCustomers = customers.filter(customer => 
            customer.createdAt.startsWith(thisMonth)
          ).length;
          
        } catch (error) {
          console.warn('Error fetching customer stats:', error);
          stats.totalCustomers = 0;
          stats.monthlyNewCustomers = 0;
        }

        try {
          // Get shop statistics (if available) - Make this optional
          const shopStats = await shopMngtService.getShopStats();
          stats.shop = shopStats;
          
        } catch (error) {
          console.warn('🚧 Shop stats endpoint not implemented yet (404) - this is expected:', error);
          // Set default empty shop stats to prevent undefined errors
          stats.shop = {
            totalShops: 0,
            activeShops: 0,
            totalBays: 0,
            availableBays: 0,
            utilizationRate: 0,
            monthlyAppointments: 0,
            monthlyRevenue: 0,
            averageRating: 0,
            topServices: []
          };
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
      // Use the smart method that filters by appointment status
      const activeRepairs = await repairOrderMngtService.getActiveRepairOrders();
      return activeRepairs.length;
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
