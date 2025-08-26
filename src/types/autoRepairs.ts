// // Enhanced types to align with Django backend models
// export interface Vehicle {
//   id: string;
//   make: string;
//   model: string;
//   year: number;
//   vin: string;
//   licensePlate: string;
//   customerId: string;
//   color?: string;
//   mileage?: number;
//   engine?: string;
//   transmission?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   city?: string;
//   state?: string;
//   zipCode?: string;
//   emergencyContact?: string;
//   emergencyPhone?: string;
//   preferredContact?: 'email' | 'phone' | 'text';
//   isActive: boolean; // Derived from User.is_active through user relationship
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Employee {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   role: 'manager' | 'technician' | 'service_advisor' | 'admin';
//   employeeId: string;
//   department?: string;
//   hourlyRate?: number;
//   hireDate: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Shop {
//   id: string;
//   name: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   phone: string;
//   email: string;
//   website?: string;
//   operatingHours: Record<string, { open: string; close: string; closed?: boolean }>;
//   services: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// // Appointment types
// export interface Appointment {
//   id: string;
//   customerId: string;
//   vehicleId: string;
//   employeeId: string; // service advisor
//   shopId: string;
//   appointmentDate: string;
//   appointmentTime: string;
//   duration: number; // in minutes
//   serviceType: string;
//   description: string;
//   status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   estimatedCost?: number;
//   notes?: string;
//   reminderSent: boolean;
//   createdAt: string;
//   updatedAt: string;
//   // Related data for display
//   customer?: Customer;
//   vehicle?: Vehicle;
//   employee?: Employee;
//   shop?: Shop;
// }

// // Repair Order types
// export interface RepairOrder {
//   id: string;
//   customerId: string;
//   vehicleId: string;
//   appointmentId?: string; // Optional link to appointment
//   assignedTechnicianId?: string;
//   serviceAdvisorId: string;
//   shopId: string;
//   workOrderNumber: string;
//   status: 'created' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled';
//   priority: 'low' | 'medium' | 'high' | 'urgent';
  
//   // Timestamps
//   createdAt: string;
//   updatedAt: string;
//   startedAt?: string;
//   completedAt?: string;
  
//   // Descriptions and notes
//   description: string;
//   customerComplaints: string;
//   diagnosis?: string;
//   workPerformed?: string;
//   recommendedServices?: string;
//   internalNotes?: string;
  
//   // Financial information
//   laborHours: number;
//   laborRate: number;
//   partsTotal: number;
//   laborTotal: number;
//   taxAmount: number;
//   discountAmount: number;
//   totalAmount: number;
  
//   // Vehicle condition
//   mileageIn?: number;
//   mileageOut?: number;
//   fuelLevel?: string;
//   vehicleCondition?: string;
  
//   // Customer authorization
//   customerSignature?: string;
//   authorizedAt?: string;
//   customerApprovalRequired: boolean;
  
//   // Related data for display
//   customer?: Customer;
//   vehicle?: Vehicle;
//   appointment?: Appointment;
//   assignedTechnician?: Employee;
//   serviceAdvisor?: Employee;
//   shop?: Shop;
//   repairOrderItems?: RepairOrderItem[];
// }

// export interface RepairOrderItem {
//   id: string;
//   repairOrderId: string;
//   type: 'labor' | 'part' | 'sublet';
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
//   partNumber?: string;
//   laborCode?: string;
//   laborHours?: number;
//   taxable: boolean;
//   warranty?: string;
//   supplierInfo?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Legacy RepairJob type for backward compatibility
// export interface RepairJob {
//   id: string;
//   vehicleId: string;
//   description: string;
//   status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
//   estimatedCost: number;
//   actualCost?: number;
//   createdAt: string;
//   completedAt?: string;
//   mechanicId?: string;
// }

// // Dashboard summary types
// export interface DashboardSummary {
//   todaysAppointments: number;
//   activeRepairOrders: number;
//   pendingApprovals: number;
//   completedToday: number;
//   totalRevenue: number;
//   averageRepairTime: number;
//   customerSatisfaction: number;
//   techniciansWorking: number;
// }

// // Service types and categories
// export interface ServiceCategory {
//   id: string;
//   name: string;
//   description: string;
//   estimatedTime: number; // in minutes
//   basePrice: number;
//   isActive: boolean;
// }

// // Calendar/Schedule types
// export interface ScheduleSlot {
//   id: string;
//   employeeId: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   isAvailable: boolean;
//   isBooked: boolean;
//   appointmentId?: string;
//   notes?: string;
// }

// // Filter and search types
// export interface AppointmentFilters {
//   status?: Appointment['status'] | Appointment['status'][];
//   dateFrom?: string;
//   dateTo?: string;
//   customerId?: string;
//   vehicleId?: string;
//   employeeId?: string;
//   shopId?: string;
//   serviceType?: string;
//   priority?: Appointment['priority'] | Appointment['priority'][];
// }

// export interface RepairOrderFilters {
//   status?: RepairOrder['status'] | RepairOrder['status'][];
//   dateFrom?: string;
//   dateTo?: string;
//   customerId?: string;
//   vehicleId?: string;
//   technicianId?: string;
//   serviceAdvisorId?: string;
//   shopId?: string;
//   priority?: RepairOrder['priority'] | RepairOrder['priority'][];
//   minAmount?: number;
//   maxAmount?: number;
//   workOrderNumber?: string;
// }

// export interface EmployeeFilters {
//   role?: Employee['role'] | Employee['role'][];
//   department?: string;
//   isActive?: boolean;
//   shopId?: string;
// }

// // API Response types
// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// // Common utility types
// export type EntityStatus = 'idle' | 'loading' | 'success' | 'error';

// export interface LoadingState {
//   [key: string]: boolean;
// }

// export interface ErrorState {
//   [key: string]: string | null;
// }
