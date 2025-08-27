import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import type { AppointmentQuery, CreateAppointmentData } from '../types';
import type { Appointment, AppointmentAPIResponse, AppointmentListAPIResponse, AppointmentListResponse, AppointmentStats, AvailableSlotsAPIResponse, CreateAppointmentAPIData, TimeSlot, UpdateAppointmentData } from '../types/appointments';


// Helper function to transform backend response to frontend format
const transformAppointmentData = (appointment: AppointmentAPIResponse): Appointment => {
  // Validate that appointment data exists
  if (!appointment) {
    throw new Error('Invalid appointment data: appointment is null or undefined');
  }

  // Parse the single date field into separate date/time components
  let appointmentDate: Date;
  let scheduledDate: string;
  let scheduledTime: string;
  
  try {
    appointmentDate = appointment.date ? new Date(appointment.date) : new Date();
    scheduledDate = appointmentDate.toISOString().split('T')[0];
    scheduledTime = appointmentDate.toTimeString().substring(0, 5);
  } catch (dateError) {
    console.warn('Error parsing appointment date:', appointment.date, dateError);
    appointmentDate = new Date();
    scheduledDate = appointmentDate.toISOString().split('T')[0];
    scheduledTime = appointmentDate.toTimeString().substring(0, 5);
  }

  // Ensure required IDs are present
  if (!appointment.id && appointment.id !== 0) {
    console.warn('Appointment missing ID:', appointment);
  }
  
  if (!appointment.customer_id && appointment.customer_id !== 0) {
    console.warn('Appointment missing customer_id:', appointment);
  }
  
  if (!appointment.vehicle_id && appointment.vehicle_id !== 0) {
    console.warn('Appointment missing vehicle_id:', appointment);
  }

  return {
    id: appointment.id?.toString() || '',
    customerId: appointment.customer_id?.toString() || '',
    vehicleId: appointment.vehicle_id?.toString() || '',
    employeeId: '', // Not in backend
    shopId: '', // Not in backend
    serviceType: 'General Service', // Not in backend
    scheduledDate,
    scheduledTime,
    appointmentDate: scheduledDate,
    appointmentTime: scheduledTime,
    duration: 60, // Default duration
    status: appointment.status === 'pending' ? 'pending' : 
           appointment.status === 'in_progress' ? 'in_progress' :
           appointment.status === 'completed' ? 'completed' :
           appointment.status === 'cancelled' ? 'cancelled' : 'pending',
    priority: 'medium', // Default priority
    description: appointment.description || '',
    notes: appointment.description || '',
    estimatedCost: 0, // Not in backend
    assignedTechnician: '', // Not in backend
    reminderSent: false, // Not in backend
    createdAt: appointment.date || new Date().toISOString(),
    updatedAt: appointment.date || new Date().toISOString(),
    date: appointment.date || new Date().toISOString(), // Add the required 'date' property
    reportedProblemId: appointment.reported_problem_id?.toString(),
    customer: appointment.customer,
    vehicle: appointment.vehicle,
    reportedProblem: appointment.reported_problem,
    checkedIn: false, // Not in backend
    checkedInAt: undefined // Not in backend
  };
};

// Appointment Management Service
export const appointmentMngtService = {
  // Get all appointments with filtering and pagination
  getAppointments: async (query: AppointmentQuery = {}): Promise<AppointmentListResponse> => {
    try {
      const endpoint = '/shop/appointments/';
      console.log('🔍 Fetching appointments with query:', query);
      
      const response = await apiGet<AppointmentListAPIResponse | AppointmentAPIResponse[]>(endpoint, query as Record<string, string | number | boolean>);
      
      console.log('🔍 Backend response type:', Array.isArray(response) ? 'Array' : 'Object');
      
      // Handle both paginated response and direct array response
      let appointments: AppointmentAPIResponse[];
      let total: number;
      
      if (Array.isArray(response)) {
        // Backend returns direct array
        appointments = response;
        total = response.length;
        console.log('🔍 Using direct array format:', { total, appointments: appointments.length });
      } else {
        // Backend returns paginated response
        const paginatedResponse = response as AppointmentListAPIResponse;
        appointments = paginatedResponse.results || [];
        total = paginatedResponse.count || 0;
        console.log('🔍 Using paginated format:', { total, appointments: appointments.length });
      }
      
      return {
        appointments: appointments.map(transformAppointmentData),
        total,
        page: query.page || 1,
        limit: query.page_size || 25,
        totalPages: Math.ceil(total / (query.page_size || 25))
      };
    } catch (error: unknown) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiGet<AppointmentAPIResponse>(`/shop/appointments/${appointmentId}/`);
    return transformAppointmentData(response);
  },

  // Create new appointment
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    try {
      console.log('🔄 Creating appointment with input data:', appointmentData);
      
      // Validate required fields
      if (!appointmentData.vehicleId && !appointmentData.vehicle_id && !appointmentData.vehicle) {
        throw new Error('Vehicle ID is required to create an appointment');
      }
      
      if (!appointmentData.scheduledDate && !appointmentData.date) {
        throw new Error('Scheduled date is required to create an appointment');
      }
      
      if (!appointmentData.scheduledTime && !appointmentData.time) {
        throw new Error('Scheduled time is required to create an appointment');
      }
      
      // Extract vehicle ID from various possible fields
      const vehicleId = appointmentData.vehicleId || appointmentData.vehicle_id || appointmentData.vehicle;
      
      // Extract date and time
      const schedDate = appointmentData.scheduledDate || appointmentData.date?.split('T')[0] || '';
      const schedTime = appointmentData.scheduledTime || appointmentData.time || appointmentData.date?.split('T')[1]?.substring(0, 5) || '';
      
      // Combine date and time for the backend's single 'date' field
      const combinedDateTime = `${schedDate}T${schedTime}:00`;
      
      console.log('📅 Combined date/time:', combinedDateTime);
      
      const createData: CreateAppointmentAPIData = {
        vehicle_id: parseInt(String(vehicleId), 10),
        description: appointmentData.description || appointmentData.notes || '',
        date: combinedDateTime,
        status: 'pending'
      };
      
      // Add reported problem ID if provided
      const problemId = appointmentData.reportedProblemId || appointmentData.reported_problem_id || appointmentData.reported_problem;
      if (problemId !== undefined && problemId !== null && problemId !== '') {
        createData.reported_problem_id = parseInt(String(problemId), 10);
      }
      
      console.log('🔄 Sending to backend:', createData);
      
      const response = await apiPost<AppointmentAPIResponse>('/shop/appointments/', createData);
      
      console.log('✅ Backend response:', response);
      
      // Ensure response has required fields before transforming
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return transformAppointmentData(response);
      
    } catch (error) {
      console.error('❌ Error in createAppointment:', error);
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    const updateData: Partial<CreateAppointmentAPIData> = {};
    
    // Only update fields that exist in the backend
    if (appointmentData.vehicleId !== undefined) {
      updateData.vehicle_id = parseInt(String(appointmentData.vehicleId));
    }
    
    if (appointmentData.description !== undefined || appointmentData.notes !== undefined) {
      updateData.description = appointmentData.description || appointmentData.notes;
    }
    
    if (appointmentData.scheduledDate && appointmentData.scheduledTime) {
      updateData.date = `${appointmentData.scheduledDate}T${appointmentData.scheduledTime}:00`;
    }
    
    if (appointmentData.status !== undefined) {
      // Map frontend status to backend status
      const backendStatus = appointmentData.status === 'scheduled' ? 'pending' :
                           appointmentData.status === 'confirmed' ? 'pending' :
                           appointmentData.status === 'no_show' ? 'cancelled' :
                           appointmentData.status;
      updateData.status = backendStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled';
    }
    
    const response = await apiPut<AppointmentAPIResponse>(`/shop/appointments/${appointmentId}/`, updateData);
    return transformAppointmentData(response);
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    await apiDelete(`/shop/appointments/${appointmentId}/`);
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<Appointment> => {
    const updateData: UpdateAppointmentData = { 
      status: 'cancelled' 
    };
    
    if (reason) {
      updateData.notes = reason;
    }
    
    return await appointmentMngtService.updateAppointment(appointmentId, updateData);
  },

  // Confirm appointment (map to pending since backend doesn't have confirmed status)
  confirmAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { status: 'pending' });
  },

  // Check in appointment (map to in_progress)
  checkInAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { 
      status: 'in_progress'
    });
  },

  // Complete appointment
  completeAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { status: 'completed' });
  },

  // Get upcoming appointments (legacy, by days range)
  getUpcomingAppointmentsByDays: async (days: number = 7): Promise<Appointment[]> => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    const query: AppointmentQuery = {
      date_from: today.toISOString().split('T')[0],
      date_to: futureDate.toISOString().split('T')[0],
      status: 'pending',
      ordering: 'date'
    };
    
    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // Get available time slots (placeholder - not implemented in backend)
  getAvailableTimeSlots: async (date: string, duration: number = 60, technicianId?: string): Promise<TimeSlot[]> => {
    const params = new URLSearchParams();
    params.append('date', date);
    params.append('duration', duration.toString());
    if (technicianId) params.append('technician_id', technicianId);
    
    try {
      const response = await apiGet<AvailableSlotsAPIResponse>(`/shop/appointments/available-slots/?${params.toString()}`);
      return response.slots?.map((slot: TimeSlot) => ({
        date: slot.date || '',
        time: slot.time || '',
        available: slot.available || false,
        duration: slot.duration || 60,
        technicianId: slot.technicianId
      })) || [];
    } catch {
      // Return empty array if endpoint doesn't exist
      return [];
    }
  },

  // Send appointment reminder (placeholder - not implemented in backend)
  sendAppointmentReminder: async (appointmentId: string): Promise<void> => {
    try {
      await apiPost(`/shop/appointments/${appointmentId}/send-reminder/`, {});
    } catch {
      // Silently fail if endpoint doesn't exist
      console.warn('Appointment reminder endpoint not available');
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, {
      scheduledDate: newDate,
      scheduledTime: newTime
    });
  },

  // Search appointments
  searchAppointments: async (searchTerm: string, options: { limit?: number; status?: Appointment['status'] } = {}): Promise<Appointment[]> => {
    const query: AppointmentQuery = {
      search: searchTerm,
      page_size: options.limit || 10
    };
    
    if (options.status) {
      // Map frontend status to backend status
      const backendStatus = options.status === 'scheduled' ? 'pending' :
                           options.status === 'confirmed' ? 'pending' :
                           options.status === 'no_show' ? 'cancelled' :
                           options.status;
      query.status = backendStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled';
    }
    
    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // Get upcoming appointments using backend filtering
  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30); // Next 30 days
      
      const query: AppointmentQuery = {
        date_from: today.toISOString().split('T')[0],
        date_to: futureDate.toISOString().split('T')[0],
        status: 'pending',
        ordering: 'date',
        page_size: 50
      };
      
      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },

  // Get appointment statistics using backend endpoint
  getAppointmentStats: async (): Promise<AppointmentStats> => {
    try {
      const response = await apiGet<AppointmentStats>('/shop/appointments/stats/');
      
      return {
        total_appointments: response.total_appointments || 0,
        todays_appointments: response.todays_appointments || 0,
        upcoming_appointments: response.upcoming_appointments || 0,
        completed_this_month: response.completed_this_month || 0,
        appointments_by_status: response.appointments_by_status || [],
        this_week_count: response.this_week_count || 0
      };
    } catch (error: unknown) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  },

  // Get appointments for a specific customer using backend filtering
  getCustomerAppointments: async (customerId: string, options: { status?: string; limit?: number } = {}): Promise<Appointment[]> => {
    try {
      const query: AppointmentQuery = {
        customer_id: customerId,
        page_size: options.limit || 50,
        ordering: '-date' // Most recent first
      };
      
      if (options.status) {
        // Map frontend status to backend status
        const backendStatus = options.status === 'scheduled' ? 'pending' :
                             options.status === 'confirmed' ? 'pending' :
                             options.status === 'no_show' ? 'cancelled' :
                             options.status;
        query.status = backendStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled';
      }
      
      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      console.error('Error fetching customer appointments:', error);
      throw error;
    }
  },

  // Get appointments for a specific vehicle using backend filtering
  getVehicleAppointments: async (vehicleId: string, options: { status?: string; limit?: number } = {}): Promise<Appointment[]> => {
    try {
      const query: AppointmentQuery = {
        vehicle_id: vehicleId,
        page_size: options.limit || 50,
        ordering: '-date' // Most recent first
      };
      
      if (options.status) {
        // Map frontend status to backend status
        const backendStatus = options.status === 'scheduled' ? 'pending' :
                             options.status === 'confirmed' ? 'pending' :
                             options.status === 'no_show' ? 'cancelled' :
                             options.status;
        query.status = backendStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled';
      }
      
      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      console.error('Error fetching vehicle appointments:', error);
      throw error;
    }
  },

  // Get today's appointments (filtered by today's date)
  getTodaysAppointments: async (): Promise<Appointment[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('🗓️ Getting today\'s appointments for date:', today);
      
      // Try backend filtering with datetime range first
      const startOfDay = `${today}T00:00:00`;
      const endOfDay = `${today}T23:59:59`;
      
      const query: AppointmentQuery = {
        date_from: startOfDay,
        date_to: endOfDay,
        ordering: 'date',
        page_size: 100
      };
      
      console.log('🗓️ Query with datetime range:', query);
      
      let response = await appointmentMngtService.getAppointments(query);
      
      console.log('🗓️ Backend response with datetime:', {
        total: response.total,
        count: response.appointments.length
      });
      
      // If datetime range doesn't work, try date-only format
      if (response.appointments.length === 0) {
        console.log('🗓️ Trying date-only format...');
        const dateQuery: AppointmentQuery = {
          date_from: today,
          date_to: today,
          ordering: 'date',
          page_size: 100
        };
        
        response = await appointmentMngtService.getAppointments(dateQuery);
        console.log('🗓️ Backend response with date-only:', {
          total: response.total,
          count: response.appointments.length
        });
      }
      
      // If backend filtering still doesn't work, fall back to client-side filtering
      if (response.appointments.length === 0) {
        console.log('🗓️ Backend filtering failed, trying client-side filtering...');
        const allResponse = await appointmentMngtService.getAppointments({ page_size: 1000 });
        
        const todaysAppointments = allResponse.appointments.filter(apt => {
          if (!apt.date) return false;
          const appointmentDate = new Date(apt.date).toISOString().split('T')[0];
          return appointmentDate === today;
        });
        
        console.log('🗓️ Client-side filtering result:', {
          total_appointments: allResponse.total,
          today_filtered: todaysAppointments.length,
          appointments: todaysAppointments.map(apt => ({
            id: apt.id,
            date: apt.date,
            parsed_date: new Date(apt.date).toISOString().split('T')[0]
          }))
        });
        
        return todaysAppointments;
      }
      
      return response.appointments;
    } catch (error: unknown) {
      console.error('Error fetching today\'s appointments:', error);
      return [];
    }
  }
};
