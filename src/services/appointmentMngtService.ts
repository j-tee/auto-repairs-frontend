import { toast } from "react-toastify";
import type {
  Appointment,
  AppointmentList,
  AppointmentListResponse,
  AppointmentQuery,
  AppointmentResponse,
  AppointmentStats,
  AppointmentStatsResponse,
  CreateAppointmentData,
  Slots,
  TimeSlot,
  TimeSlotResponse,
  UpdateAppointmentData,
} from "../types/appointments";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../utils/api";
// import { AppointmentListResponse } from '../types/appointments';

// Appointment Management Service
export const appointmentMngtService = {
  // Get all appointments with filtering and pagination
  getAppointments: async (
    query: AppointmentQuery = {}
  ): Promise<AppointmentList> => {
    const endpoint = "/shop/appointments/";
    
    const response = await apiGet<AppointmentListResponse>(endpoint, query);

    const appointmentsArray: AppointmentResponse[] = Array.isArray(response)
      ? (response as AppointmentResponse[])
      : response.results || [];

    return {
      appointments: appointmentsArray.map(
        (appointment: AppointmentResponse) => {
          return {
            id: appointment.id?.toString() || "",
            customerId: appointment.customer_id?.toString() || "",
            vehicleId: appointment.vehicle_id?.toString() || "",
            serviceType: "General Service", // Default since not in backend schema
            scheduledDate: appointment.date
              ? appointment.date.split("T")[0]
              : "",
            scheduledTime: appointment.date
              ? appointment.date.split("T")[1]?.substring(0, 5)
              : "",
            duration: 60, // Default duration
            status: appointment.status || "pending",
            priority: "medium", // Default since not in backend schema
            description: appointment.description || "",
            notes: appointment.notes || "",
            estimatedCost: 0, // Default since not in backend schema
            assignedTechnician: appointment.assigned_technician || "", // Map from backend
            createdAt: appointment.date || "",
            updatedAt: appointment.date || "",
            reportedProblemId:
              appointment.reported_problem_id?.toString() || "",
            // Map the enhanced customer data from backend
            customer: appointment.customer
              ? {
                  id: appointment.customer.id?.toString() || "",
                  name: appointment.customer.name || "Unknown Customer",
                  email: appointment.customer.email || "",
                  phone_number: appointment.customer.phone_number || "",
                  address: appointment.customer.address || "",
                }
              : undefined,
            // Map the enhanced vehicle data from backend
            vehicle: appointment.vehicle
              ? {
                  id: appointment.vehicle.id?.toString() || "",
                  make: appointment.vehicle.make || "",
                  model: appointment.vehicle.model || "",
                  year: appointment.vehicle.year || 2020,
                  licensePlate: appointment.vehicle.license_plate || "",
                  vin: appointment.vehicle.vin || "",
                  color: appointment.vehicle.color || "",
                }
              : undefined,
            // Map the enhanced vehicle problem data from backend
            reportedProblem: appointment.reported_problem
              ? {
                  id: appointment.reported_problem.id?.toString() || "",
                  vehicleId: appointment.vehicle_id?.toString() || "",
                  description: appointment.reported_problem.description || "",
                  resolved: appointment.reported_problem.resolved || false,
                  reportedDate:
                    appointment.reported_problem.reported_date || "",
                }
              : undefined,
          };
        }
      ),
      total: Array.isArray(response)
        ? response.length
        : response.count ||
          (Array.isArray(response.results) ? response.results.length : 0),
      page: 1, // Default page
      limit: 50, // Default limit
      totalPages: 1, // Default total pages
    };
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiGet<AppointmentResponse>(
      `/shop/appointments/${appointmentId}/`
    );

    return {
      id: response.id?.toString() || "",
      customerId: response.customer_id?.toString() || "",
      vehicleId: response.vehicle_id?.toString() || "",
      serviceType: response.service_type || "",
      scheduledDate: response.scheduled_date || "",
      scheduledTime: response.scheduled_time || "",
      duration: response.duration || 60,
      status: response.status || "scheduled",
      priority: response.priority || "medium",
      description: response.description,
      notes: response.notes,
      estimatedCost: response.estimated_cost,
      assignedTechnician: response.technician?.toString(),
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer
        ? {
            id: response.customer.id?.toString() || "",
            name: response.customer.name || "",
            email: response.customer.email || "",
            phone_number: response.customer.phone_number || "",
            address: response.customer.address || "",
          }
        : undefined,
      vehicle: response.vehicle
        ? {
            id: response.vehicle.id?.toString() || "",
            make: response.vehicle.make || "",
            model: response.vehicle.model || "",
            year: response.vehicle.year || new Date().getFullYear(),
            licensePlate: response.vehicle.license_plate || "",
          }
        : undefined,
      technician: response.technician
        ? {
            id: response.technician.id?.toString() || "",
            firstName: response.technician.first_name || "",
            lastName: response.technician.last_name || "",
            specialties: response.technician.specialties || [],
          }
        : undefined,
      reminderSent: response.reminder_sent || false,
      checkedIn: response.checked_in || false,
      checkedInAt: response.checked_in_at,
    };
  },

  // Create new appointment
  createAppointment: async (
    appointmentData: CreateAppointmentData
  ): Promise<Appointment> => {
    // Combine date and time for the backend
    const combinedDateTime = `${appointmentData.scheduledDate}T${appointmentData.scheduledTime}:00`;

    const createData: Partial<AppointmentResponse> = {
      vehicle_id: appointmentData.vehicleId, //parseInt(),
      date: combinedDateTime,
      description:
        appointmentData.description || `${appointmentData.serviceType} service`,
      status: "pending",
    };

    // Add reported problem ID if provided
    if (appointmentData.reportedProblemId) {
      createData.reported_problem_id = parseInt(
        appointmentData.reportedProblemId
      );
    }

    const response = await apiPost<AppointmentResponse>(
      "/shop/appointments/",
      createData
    );

    // Parse the date field back into separate components
    const dateObj = response.date ? new Date(response.date) : new Date();
    const scheduledDate = dateObj.toISOString().split("T")[0];
    const scheduledTime = dateObj.toTimeString().substring(0, 5);

    return {
      id: response.id?.toString() || "",
      customerId:
        response.vehicle?.customer?.id?.toString() ||
        appointmentData.customerId,
      vehicleId: response.vehicle_id?.toString() || "",
      serviceType: appointmentData.serviceType || "General Service",
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      duration: appointmentData.duration || 60,
      status: response.status || "pending",
      priority: appointmentData.priority || "medium",
      description: response.description || "",
      notes: appointmentData.notes || "",
      estimatedCost: appointmentData.estimatedCost || 0,
      assignedTechnician: appointmentData.assignedTechnician || "",
      createdAt: response.date || new Date().toISOString(),
      updatedAt: response.date || new Date().toISOString(),
    };
  },

  // Update appointment
  updateAppointment: async (
    appointmentId: string,
    appointmentData: UpdateAppointmentData
  ): Promise<Appointment> => {
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
      checked_in: appointmentData.checkedIn,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const response = await apiPut<AppointmentResponse>(
      `/shop/appointments/${appointmentId}/`,
      updateData
    );

    return {
      id: response.id?.toString() || "",
      customerId: response.customer_id?.toString() || "",
      vehicleId: response.vehicle_id?.toString() || "",
      serviceType: response.service_type || "",
      scheduledDate: response.scheduled_date || "",
      scheduledTime: response.scheduled_time || "",
      duration: response.duration || 60,
      status: response.status || "scheduled",
      priority: response.priority || "medium",
      description: response.description,
      notes: response.notes,
      estimatedCost: response.estimated_cost,
      assignedTechnician: response.technician?.toString(),
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer
        ? {
            id: response.customer.id?.toString() || "",
            name: response.customer.name || "",
            email: response.customer.email || "",
            phone_number: response.customer.phone_number || "",
            address: response.customer.address || "",
          }
        : undefined,
      vehicle: response.vehicle
        ? {
            id: response.vehicle.id?.toString() || "",
            make: response.vehicle.make || "",
            model: response.vehicle.model || "",
            year: response.vehicle.year || new Date().getFullYear(),
            licensePlate: response.vehicle.license_plate || "",
          }
        : undefined,
      technician: response.technician
        ? {
            id: response.technician.id?.toString() || "",
            firstName: response.technician.first_name || "",
            lastName: response.technician.last_name || "",
            specialties: response.technician.specialties || [],
          }
        : undefined,
      reminderSent: response.reminder_sent || false,
      checkedIn: response.checked_in || false,
      checkedInAt: response.checked_in_at,
    };
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    await apiDelete(`/shop/appointments/${appointmentId}/`);
  },

  // Cancel appointment
  cancelAppointment: async (
    appointmentId: string,
    reason?: string
  ): Promise<Appointment> => {
    const updateData: UpdateAppointmentData = {
      status: "cancelled",
    };

    if (reason) {
      updateData.notes = reason;
    }

    return await appointmentMngtService.updateAppointment(
      appointmentId,
      updateData
    );
  },

  // Confirm appointment
  confirmAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, {
      status: "confirmed",
    });
  },

  // Check in appointment
  checkInAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, {
      checkedIn: true,
      status: "pending",
    });
  },

  // Complete appointment
  completeAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, {
      status: "completed",
    });
  },

  // Get today's appointments
  // (removed duplicate getTodaysAppointments to resolve object literal property conflict)

  // Get upcoming appointments (legacy, by days range)
  getUpcomingAppointmentsByDays: async (
    days: number = 7
  ): Promise<Appointment[]> => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const query: AppointmentQuery = {
      dateFrom: today.toISOString().split("T")[0],
      dateTo: futureDate.toISOString().split("T")[0],
      status: "scheduled",
      sortBy: "scheduled_date",
      sortOrder: "asc",
    };

    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // Get appointment statistics
  // (removed duplicate getAppointmentStats method to resolve object literal property conflict)

  // Get available time slots
  getAvailableTimeSlots: async (
    date: string,
    duration: number = 60,
    technicianId?: string
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams();
    params.append("date", date);
    params.append("duration", duration.toString());
    if (technicianId) params.append("technician_id", technicianId);

    const response = await apiGet<TimeSlotResponse>(
      `/shop/appointments/available-slots/?${params.toString()}`
    );

    return (
      response.slots?.map((slot: Slots) => ({
        date: slot.date || "",
        time: slot.time || "",
        available: slot.available || false,
        duration: slot.duration || 60,
        technicianId: slot.technician_id?.toString(),
      })) || []
    );
  },

  // Send appointment reminder
  sendAppointmentReminder: async (appointmentId: string): Promise<void> => {
    await apiPost(`/shop/appointments/${appointmentId}/send-reminder/`, {});
    await appointmentMngtService.updateAppointment(appointmentId, {
      reminderSent: true,
    });
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> => {
    return await appointmentMngtService.updateAppointment(appointmentId, {
      scheduledDate: newDate,
      scheduledTime: newTime,
    });
  },

  // Search appointments
  searchAppointments: async (
    searchTerm: string,
    options: { limit?: number; status?: Appointment["status"] } = {}
  ): Promise<Appointment[]> => {
    const query: AppointmentQuery = {
      search: searchTerm,
      limit: options.limit || 10,
    };

    if (options.status) {
      query.status = options.status;
    }

    const response = await appointmentMngtService.getAppointments(query);
    return response.appointments;
  },

  // ====== NEW ENHANCED API METHODS ======

  // Get upcoming appointments using specialized endpoint
  getUpcomingAppointments: async (): Promise<AppointmentList> => {
    try {
      const response = await apiGet<AppointmentListResponse>(
        "/shop/appointments/upcoming/"
      );

      const appointsArray: AppointmentResponse[] = Array.isArray(response)
        ? (response as AppointmentResponse[])
        : response.results || [];

      return {
        appointments: appointsArray.map((appointment: AppointmentResponse) => ({
          id: appointment.id?.toString() || "",
          customerId: appointment.customer_id?.toString() || "",
          vehicleId: appointment.vehicle_id?.toString() || "",
          serviceType: "General Service", // Default since not in backend schema
          scheduledDate: appointment.date ? appointment.date.split("T")[0] : "",
          scheduledTime: appointment.date
            ? appointment.date.split("T")[1]?.substring(0, 5)
            : "",
          duration: 60, // Default duration
          status: appointment.status || "pending",
          priority: "medium", // Default since not in backend schema
          description: appointment.description || "",
          notes: appointment.notes || "",
          estimatedCost: 0, // Default since not in backend schema
          assignedTechnician: "", // Default since not in backend schema
          createdAt: appointment.date || "",
          updatedAt: appointment.date || "",
          reportedProblemId: appointment.reported_problem_id?.toString() || "",
          // Map the enhanced customer data from backend
          customer: appointment.customer
            ? {
                id: appointment.customer.id?.toString() || "",
                name: appointment.customer.name || "Unknown Customer",
                email: appointment.customer.email || "",
                phone_number: appointment.customer.phone_number || "",
                address: appointment.customer.address || "",
              }
            : undefined,
          // Map the enhanced vehicle data from backend
          vehicle: appointment.vehicle
            ? {
                id: appointment.vehicle.id?.toString() || "",
                make: appointment.vehicle.make || "",
                model: appointment.vehicle.model || "",
                year: appointment.vehicle.year || 2020,
                licensePlate: appointment.vehicle.license_plate || "",
                vin: appointment.vehicle.vin || "",
                color: appointment.vehicle.color || "",
              }
            : undefined,
        })),
        total: Array.isArray(response)
          ? response.length
          : response.count ||
            (Array.isArray(response.results) ? response.results.length : 0),
        page: 1, // Default page
        limit: 50, // Default limit
        totalPages: 1, // Default total pages
      };
    } catch (error: unknown) {
      toast.error(
        "Error fetching upcoming appointments: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get appointment statistics using specialized endpoint
  getAppointmentStats: async (): Promise<AppointmentStats> => {
    try {
      const response = await apiGet<AppointmentStatsResponse>(
        "/shop/appointments/stats/"
      );

      return {
        totalAppointments: response.total_appointments || 0,
        todaysAppointments: response.todays_appointments || 0,
        upcomingAppointments: response.upcoming_appointments || 0,
        completedThisMonth: response.completed_this_month || 0,
        cancelledThisMonth: response.cancelled_this_month || 0,
        averageDuration: response.average_duration || 60,
        appointmentsByStatus: {
          scheduled: response.appointments_by_status?.scheduled || 0,
          confirmed: response.appointments_by_status?.confirmed || 0,
          pending: response.appointments_by_status?.pending || 0,
          completed: response.appointments_by_status?.completed || 0,
          cancelled: response.appointments_by_status?.cancelled || 0,
          no_show: response.appointments_by_status?.no_show || 0,
        },
        revenueThisMonth: response.revenue_this_month || 0,
      };
    } catch (error: unknown) {
      toast.error(
        "Error fetching appointment stats: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get appointments for a specific customer using backend filtering
  getCustomerAppointments: async (
    customerId: string,
    options: { status?: string; limit?: number } = {}
  ): Promise<Appointment[]> => {
    try {
      const query: AppointmentQuery = {
        customerId,
        limit: options.limit || 50,
        sortBy: "date",
        sortOrder: "desc",
      };

      if (options.status) {
        query.status = options.status as Appointment["status"];
      }

      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      toast.error(
        "Error fetching customer appointments: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get appointments for a specific vehicle using backend filtering
  getVehicleAppointments: async (
    vehicleId: string,
    options: { status?: string; limit?: number } = {}
  ): Promise<Appointment[]> => {
    try {
      const query: AppointmentQuery = {
        vehicleId,
        limit: options.limit || 50,
        sortBy: "date",
        sortOrder: "desc",
      };

      if (options.status) {
        query.status = options.status as Appointment["status"];
      }

      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      toast.error(
        "Error fetching vehicle appointments: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Get today's appointments using backend filtering
  getTodaysAppointments: async (): Promise<Appointment[]> => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const query: AppointmentQuery = {
        dateFrom: today,
        dateTo: today,
        sortBy: "date",
        sortOrder: "asc",
      };

      const response = await appointmentMngtService.getAppointments(query);
      return response.appointments;
    } catch (error: unknown) {
      toast.error(
        `Error fetching today's appointments: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  },

  // NEW: Technician Assignment Workflow Methods
  // Assign technician (employee) to appointment
  assignTechnician: async (appointmentId: string, technicianId: string): Promise<Appointment> => {
    try {
      console.log('🔧 appointmentMngtService.assignTechnician called with:', { appointmentId, technicianId });
      
      // Convert string IDs to numbers for backend API
      const numericTechnicianId = parseInt(technicianId, 10);
      if (isNaN(numericTechnicianId)) {
        toast.error('Invalid technician ID: must be a number');
      }

      const requestData = { 
        assigned_technician_id: numericTechnicianId,
        status: "assigned" 
      };
      
      console.log('📡 Making API call:', {
        endpoint: `/shop/appointments/${appointmentId}/`,
        method: 'PATCH',
        data: requestData
      });

      // Use PATCH method to update appointment with technician assignment
      const response = await apiPatch<AppointmentResponse>(
        `/shop/appointments/${appointmentId}/`,
        requestData
      );

      console.log('🔍 Raw API response:', response);

      return {
        id: response.id?.toString() || "",
        customerId: response.customer_id?.toString() || "",
        vehicleId: response.vehicle_id?.toString() || "",
        serviceType: "General Service",
        scheduledDate: response.date ? response.date.split("T")[0] : "",
        scheduledTime: response.date ? response.date.split("T")[1]?.substring(0, 5) : "",
        duration: 60,
        status: (response.status as Appointment["status"]) || "assigned",
        priority: "medium",
        description: response.description || "",
        notes: response.notes || "",
        assignedTechnician: response.assigned_technician_id?.toString() || "",
        assigned_technician_id: response.assigned_technician_id 
          ? (typeof response.assigned_technician_id === 'string' 
              ? parseInt(response.assigned_technician_id, 10) 
              : response.assigned_technician_id)
          : undefined,
        assigned_technician: response.assigned_technician,
        assigned_at: response.assigned_at,
        started_at: response.started_at,
        completed_at: response.completed_at,
        customer: response.customer,
        vehicle: response.vehicle ? {
          id: response.vehicle.id ? parseInt(response.vehicle.id.toString(), 10) : undefined,
          make: response.vehicle.make,
          model: response.vehicle.model,
          year: response.vehicle.year,
          license_plate: response.vehicle.license_plate,
          vin: response.vehicle.vin,
          color: response.vehicle.color,
          customer: response.vehicle.customer ? {
            id: response.vehicle.customer.id ? parseInt(response.vehicle.customer.id.toString(), 10) : undefined,
            name: response.vehicle.customer.name,
            phone_number: response.vehicle.customer.phone_number,
            email: response.vehicle.customer.email
          } : undefined
        } : undefined,
        createdAt: response.created_at || "",
        updatedAt: response.updated_at || "",
      };
    } catch (error: unknown) {
      toast.error(
        "Error assigning technician: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Start work (assigned → in_progress)
  startWork: async (appointmentId: string): Promise<Appointment> => {
    try {
      // Use standard PATCH endpoint to update appointment status to in_progress
      const response = await apiPut<AppointmentResponse>(
        `/shop/appointments/${appointmentId}/`,
        { status: "in_progress" }
      );

      return {
        id: response.id?.toString() || "",
        customerId: response.customer_id?.toString() || "",
        vehicleId: response.vehicle_id?.toString() || "",
        serviceType: "General Service",
        scheduledDate: response.date ? response.date.split("T")[0] : "",
        scheduledTime: response.date ? response.date.split("T")[1]?.substring(0, 5) : "",
        duration: 60,
        status: response.status || "in_progress",
        priority: "medium",
        assignedTechnician: response.assigned_technician_id?.toString() || "",
        assigned_technician_id: response.assigned_technician_id 
          ? (typeof response.assigned_technician_id === 'string' 
              ? parseInt(response.assigned_technician_id, 10) 
              : response.assigned_technician_id)
          : undefined,
        assigned_technician: response.assigned_technician,
        assigned_technician_id: response.assigned_technician_id,
        assigned_technician: response.assigned_technician,
        assigned_at: response.assigned_at,
        started_at: response.started_at,
        completed_at: response.completed_at,
        customer: response.customer,
        vehicle: response.vehicle,
        createdAt: response.created_at || "",
        updatedAt: response.updated_at || "",
      };
    } catch (error: unknown) {
      toast.error(
        "Error starting work: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },

  // Complete work (in_progress → completed)
  completeWork: async (appointmentId: string): Promise<Appointment> => {
    try {
      // Use standard PATCH endpoint to update appointment status to completed
      const response = await apiPut<AppointmentResponse>(
        `/shop/appointments/${appointmentId}/`,
        { status: "completed" }
      );

      return {
        id: response.id?.toString() || "",
        customerId: response.customer_id?.toString() || "",
        vehicleId: response.vehicle_id?.toString() || "",
        serviceType: "General Service",
        scheduledDate: response.date ? response.date.split("T")[0] : "",
        scheduledTime: response.date ? response.date.split("T")[1]?.substring(0, 5) : "",
        duration: 60,
        status: response.status || "completed",
        priority: "medium",
        description: response.description || "",
        notes: response.notes || "",
        assignedTechnician: response.assigned_technician_id?.toString() || "",
        assigned_technician_id: response.assigned_technician_id,
        assigned_technician: response.assigned_technician,
        assigned_at: response.assigned_at,
        started_at: response.started_at,
        completed_at: response.completed_at,
        customer: response.customer,
        vehicle: response.vehicle,
        createdAt: response.created_at || "",
        updatedAt: response.updated_at || "",
      };
    } catch (error: unknown) {
      toast.error(
        "Error completing work: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  },
};
