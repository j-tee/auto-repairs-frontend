import { appointmentMngtService } from './appointmentMngtService';
import { customerMngtService } from './customerMngtService';
import { vehicleMngtService } from './vehicleMngtService';
import { repairOrderMngtService } from './repairOrderMngtService';
import { shopMngtService } from './shopMngtService';
import type { DashboardStats, DashboardSummary } from '../types/dashboard';

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
            // Get customer appointments - Fixed field names
            const appointmentResponse = await appointmentMngtService.getAppointments({
              customer_id: userId,
              page_size: 1000
            });
            
            // Get customer vehicles - Using frontend interface field names
            const vehiclesResponse = await vehicleMngtService.getVehicles({
              customerId: userId,
              limit: 1000
            });
            
            // Get customer repair orders - Using frontend interface field names
            const repairOrdersResponse = await repairOrderMngtService.getRepairOrdersByCustomer(parseInt(userId));
            
            stats.customerVehicles = vehiclesResponse.vehicles?.length || 0;
            stats.customerActiveAppointments = appointmentResponse.appointments.filter(
              apt => ['scheduled', 'confirmed', 'in_progress'].includes(apt.status)
            ).length;
            stats.customerRepairOrders = repairOrdersResponse.length || 0;
            stats.customerTotalSpent = repairOrdersResponse.reduce(
              (sum: number, order) => sum + (order.total || 0), 0
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
          // Get appointment statistics - Use existing appointments endpoint with correct field names
          const appointmentsResponse = await appointmentMngtService.getAppointments({ page_size: 1000 });
          const appointments = appointmentsResponse.appointments;
          
          // Calculate today's appointments - use the 'date' field from backend
          const today = new Date().toISOString().split('T')[0];
          console.log('🔍 Dashboard Service - Today date:', today);
          
          const todaysAppointments = appointments.filter(apt => {
            if (!apt.date) return false;
            
            // Parse the original date field from backend (full datetime)
            const appointmentDate = new Date(apt.date).toISOString().split('T')[0];
            const matches = appointmentDate === today;
            
            console.log('🔍 Dashboard filter check:', {
              id: apt.id,
              original_date: apt.date,
              parsed_date: appointmentDate,
              today,
              matches
            });
            
            return matches;
          });
          
          stats.todaysAppointments = todaysAppointments.length;
          
          console.log('🔍 Dashboard Service - Today\'s appointments result:', {
            filtered_count: todaysAppointments.length
          });
          
          // Calculate monthly appointments (completed this month)
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          stats.monthlyAppointments = appointments.filter(apt => {
            const appointmentDate = apt.scheduledDate || apt.appointmentDate;
            return appointmentDate && appointmentDate.startsWith(thisMonth) && apt.status === 'completed';
          }).length;
          
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
          // Get customer statistics - Use existing customers endpoint with frontend field names
          const customersResponse = await customerMngtService.getCustomers({ limit: 1000 });
          const customers = customersResponse.customers;
          
          stats.totalCustomers = customers.length;
          
          // Calculate new customers this month
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          stats.monthlyNewCustomers = customers.filter(customer => 
            customer.created_at?.startsWith(thisMonth)
          ).length;
          
        } catch (error) {
          console.warn('Error fetching customer stats:', error);
          stats.totalCustomers = 0;
          stats.monthlyNewCustomers = 0;
        }

        try {
          // Get shop statistics (if available) - Make this optional
          const shopStats = await shopMngtService.getShopStats();
          stats.shop = shopStats; // Use the transformed data directly
          
        } catch (error) {
          console.warn('🚧 Shop stats endpoint not implemented yet (404) - this is expected:', error);
          // Set default empty shop stats to prevent undefined errors
          stats.shop = {
            id: '',
            name: '',
            totalTechnicians: 0,
            activeTechnicians: 0,
            averageRepairTime: 0,
            customerSatisfactionScore: 0,
            monthlyRevenue: 0,
            completedRepairsThisMonth: 0,
            pendingRepairs: 0,
            capacityUtilization: 0
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
        date_from: today,
        date_to: today,
        page_size: 1 // We only need the count
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
        date_from: today,
        date_to: today
      });
      
      return response.reduce((total: number, order) => {
        return total + (order.total || 0);
      }, 0);
    } catch (error) {
      console.warn('Error fetching today\'s revenue:', error);
      return 0;
    }
  }
};
