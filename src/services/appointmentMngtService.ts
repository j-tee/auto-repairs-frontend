import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

// Appointment types
export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  notes?: string;
  estimatedCost?: number;
  assignedTechnician?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  technician?: {
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  reminderSent?: boolean;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface CreateAppointmentData {
  customerId: string;
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  priority?: Appointment['priority'];
  description?: string;
  notes?: string;
  estimatedCost?: number;
  assignedTechnician?: string;
}

export interface UpdateAppointmentData {
  customerId?: string;
  vehicleId?: string;
  serviceType?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: Appointment['status'];
  priority?: Appointment['priority'];
  description?: string;
  notes?: string;
  estimatedCost?: number;
  assignedTechnician?: string;
  reminderSent?: boolean;
  checkedIn?: boolean;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  status?: Appointment['status'];
  priority?: Appointment['priority'];
  dateFrom?: string;
  dateTo?: string;
  serviceType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentStats {
  totalAppointments: number;
  todaysAppointments: number;
  upcomingAppointments: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
  averageDuration: number;
  appointmentsByStatus: {
    scheduled: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  revenueThisMonth: number;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
  technicianId?: string;
}

// Appointment Management Service
export const appointmentMngtService = {
  // Get all appointments with filtering and pagination
  getAppointments: async (query: AppointmentQuery = {}): Promise<AppointmentListResponse> => {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.customerId) params.append('customer_id', query.customerId);
    if (query.vehicleId) params.append('vehicle_id', query.vehicleId);
    if (query.technicianId) params.append('technician_id', query.technicianId);
    if (query.status) params.append('status', query.status);
    if (query.priority) params.append('priority', query.priority);
    if (query.dateFrom) params.append('date_from', query.dateFrom);
    if (query.dateTo) params.append('date_to', query.dateTo);
    if (query.serviceType) params.append('service_type', query.serviceType);
    if (query.sortBy) params.append('sort_by', query.sortBy);
    if (query.sortOrder) params.append('sort_order', query.sortOrder);
    
    const queryString = params.toString();
    const endpoint = `/shop/appointments/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<any>(endpoint);
    
    return {
      appointments: response.results?.map((appointment: any) => ({
        id: appointment.id?.toString() || '',
        customerId: appointment.customer_id?.toString() || '',
        vehicleId: appointment.vehicle_id?.toString() || '',
        serviceType: appointment.service_type || '',
        scheduledDate: appointment.scheduled_date || '',
        scheduledTime: appointment.scheduled_time || '',
        duration: appointment.duration || 60,
        status: appointment.status || 'scheduled',
        priority: appointment.priority || 'medium',
        description: appointment.description,
        notes: appointment.notes,
        estimatedCost: appointment.estimated_cost,
        assignedTechnician: appointment.assigned_technician?.toString(),
        createdAt: appointment.created_at || new Date().toISOString(),
        updatedAt: appointment.updated_at || new Date().toISOString(),
        customer: appointment.customer ? {
          id: appointment.customer.id?.toString() || '',
          firstName: appointment.customer.first_name || '',
          lastName: appointment.customer.last_name || '',
          email: appointment.customer.email || '',
          phone: appointment.customer.phone || ''
        } : undefined,
        vehicle: appointment.vehicle ? {
          id: appointment.vehicle.id?.toString() || '',
          make: appointment.vehicle.make || '',
          model: appointment.vehicle.model || '',
          year: appointment.vehicle.year || new Date().getFullYear(),
          licensePlate: appointment.vehicle.license_plate || ''
        } : undefined,
        technician: appointment.technician ? {
          id: appointment.technician.id?.toString() || '',
          firstName: appointment.technician.first_name || '',
          lastName: appointment.technician.last_name || '',
          specialties: appointment.technician.specialties || []
        } : undefined,
        reminderSent: appointment.reminder_sent || false,
        checkedIn: appointment.checked_in || false,
        checkedInAt: appointment.checked_in_at
      })) || [],
      total: response.count || 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil((response.count || 0) / (query.limit || 10))
    };
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiGet<any>(`/shop/appointments/${appointmentId}/`);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      serviceType: response.service_type || '',
      scheduledDate: response.scheduled_date || '',
      scheduledTime: response.scheduled_time || '',
      duration: response.duration || 60,
      status: response.status || 'scheduled',
      priority: response.priority || 'medium',
      description: response.description,
      notes: response.notes,
      estimatedCost: response.estimated_cost,
      assignedTechnician: response.assigned_technician?.toString(),
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      vehicle: response.vehicle ? {
        id: response.vehicle.id?.toString() || '',
        make: response.vehicle.make || '',
        model: response.vehicle.model || '',
        year: response.vehicle.year || new Date().getFullYear(),
        licensePlate: response.vehicle.license_plate || ''
      } : undefined,
      technician: response.technician ? {
        id: response.technician.id?.toString() || '',
        firstName: response.technician.first_name || '',
        lastName: response.technician.last_name || '',
        specialties: response.technician.specialties || []
      } : undefined,
      reminderSent: response.reminder_sent || false,
      checkedIn: response.checked_in || false,
      checkedInAt: response.checked_in_at
    };
  },

  // Create new appointment
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const createData = {
      customer_id: appointmentData.customerId,
      vehicle_id: appointmentData.vehicleId,
      service_type: appointmentData.serviceType,
      scheduled_date: appointmentData.scheduledDate,
      scheduled_time: appointmentData.scheduledTime,
      duration: appointmentData.duration || 60,
      priority: appointmentData.priority || 'medium',
      description: appointmentData.description,
      notes: appointmentData.notes,
      estimated_cost: appointmentData.estimatedCost,
      assigned_technician: appointmentData.assignedTechnician
    };
    
    const response = await apiPost<any>('/shop/appointments/', createData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      serviceType: response.service_type || '',
      scheduledDate: response.scheduled_date || '',
      scheduledTime: response.scheduled_time || '',
      duration: response.duration || 60,
      status: response.status || 'scheduled',
      priority: response.priority || 'medium',
      description: response.description,
      notes: response.notes,
      estimatedCost: response.estimated_cost,
      assignedTechnician: response.assigned_technician?.toString(),
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      reminderSent: response.reminder_sent || false,
      checkedIn: response.checked_in || false,
      checkedInAt: response.checked_in_at
    };
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    const updateData = {
      customer_id: appointmentData.customerId,
      vehicle_id: appointmentData.vehicleId,
      service_type: appointmentData.serviceType,
      scheduled_date: appointmentData.scheduledDate,
      scheduled_time: appointmentData.scheduledTime,
      duration: appointmentData.duration,
      status: appointmentData.status,
      priority: appointmentData.priority,
      description: appointmentData.description,
      notes: appointmentData.notes,
      estimated_cost: appointmentData.estimatedCost,
      assigned_technician: appointmentData.assignedTechnician,
      reminder_sent: appointmentData.reminderSent,
      checked_in: appointmentData.checkedIn
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    const response = await apiPut<any>(`/shop/appointments/${appointmentId}/`, updateData);
    
    return {
      id: response.id?.toString() || '',
      customerId: response.customer_id?.toString() || '',
      vehicleId: response.vehicle_id?.toString() || '',
      serviceType: response.service_type || '',
      scheduledDate: response.scheduled_date || '',
      scheduledTime: response.scheduled_time || '',
      duration: response.duration || 60,
      status: response.status || 'scheduled',
      priority: response.priority || 'medium',
      description: response.description,
      notes: response.notes,
      estimatedCost: response.estimated_cost,
      assignedTechnician: response.assigned_technician?.toString(),
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer ? {
        id: response.customer.id?.toString() || '',
        firstName: response.customer.first_name || '',
        lastName: response.customer.last_name || '',
        email: response.customer.email || '',
        phone: response.customer.phone || ''
      } : undefined,
      vehicle: response.vehicle ? {
        id: response.vehicle.id?.toString() || '',
        make: response.vehicle.make || '',
        model: response.vehicle.model || '',
        year: response.vehicle.year || new Date().getFullYear(),
        licensePlate: response.vehicle.license_plate || ''
      } : undefined,
      technician: response.technician ? {
        id: response.technician.id?.toString() || '',
        firstName: response.technician.first_name || '',
        lastName: response.technician.last_name || '',
        specialties: response.technician.specialties || []
      } : undefined,
      reminderSent: response.reminder_sent || false,
      checkedIn: response.checked_in || false,
      checkedInAt: response.checked_in_at
    };
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

  // Confirm appointment
  confirmAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { status: 'confirmed' });
  },

  // Check in appointment
  checkInAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { 
      checkedIn: true,
      status: 'in_progress'
    });
  },

  // Complete appointment
  completeAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, { status: 'completed' });
  },

  // Get today's appointments
  getTodaysAppointments: async (): Promise<Appointment[]> => {
    const today = new Date().toISOString().split('T')[0];
    const query: AppointmentQuery = {
      dateFrom: today,
      dateTo: today,
      sortBy: 'scheduled_time',
      sortOrder: 'asc'
    };
    
    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (days: number = 7): Promise<Appointment[]> => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    const query: AppointmentQuery = {
      dateFrom: today.toISOString().split('T')[0],
      dateTo: futureDate.toISOString().split('T')[0],
      status: 'scheduled',
      sortBy: 'scheduled_date',
      sortOrder: 'asc'
    };
    
    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // Get appointment statistics
  getAppointmentStats: async (): Promise<AppointmentStats> => {
    const response = await apiGet<any>('/shop/appointments/stats/');
    
    return {
      totalAppointments: response.total_appointments || 0,
      todaysAppointments: response.todays_appointments || 0,
      upcomingAppointments: response.upcoming_appointments || 0,
      completedThisMonth: response.completed_this_month || 0,
      cancelledThisMonth: response.cancelled_this_month || 0,
      averageDuration: response.average_duration || 0,
      appointmentsByStatus: {
        scheduled: response.appointments_by_status?.scheduled || 0,
        confirmed: response.appointments_by_status?.confirmed || 0,
        in_progress: response.appointments_by_status?.in_progress || 0,
        completed: response.appointments_by_status?.completed || 0,
        cancelled: response.appointments_by_status?.cancelled || 0,
        no_show: response.appointments_by_status?.no_show || 0
      },
      revenueThisMonth: response.revenue_this_month || 0
    };
  },

  // Get available time slots
  getAvailableTimeSlots: async (date: string, duration: number = 60, technicianId?: string): Promise<TimeSlot[]> => {
    const params = new URLSearchParams();
    params.append('date', date);
    params.append('duration', duration.toString());
    if (technicianId) params.append('technician_id', technicianId);
    
    const response = await apiGet<any>(`/shop/appointments/available-slots/?${params.toString()}`);
    
    return response.slots?.map((slot: any) => ({
      date: slot.date || '',
      time: slot.time || '',
      available: slot.available || false,
      duration: slot.duration || 60,
      technicianId: slot.technician_id?.toString()
    })) || [];
  },

  // Send appointment reminder
  sendAppointmentReminder: async (appointmentId: string): Promise<void> => {
    await apiPost(`/shop/appointments/${appointmentId}/send-reminder/`, {});
    await appointmentMngtService.updateAppointment(appointmentId, { reminderSent: true });
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
      limit: options.limit || 10
    };
    
    if (options.status) {
      query.status = options.status;
    }
    
    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  }
};
