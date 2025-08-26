/**
 * Central Type Exports - Single Source of Truth
 * 
 * This file exports types from dedicated domain-specific type files.
 * Each domain has its own comprehensive type definitions to avoid 
 * conflicts and provide better organization.
 */

// Authentication types
export * from './auth';

// Customer types
export * from './customers';

// Vehicle types  
export * from './vehicles';
export type { VehicleProblem as VehicleProblemType } from './vehicles';

// Employee types
export * from './employees';

// Shop types
export * from './shops';
// Appointment types
export * from './appointments';

// Repair Order types
export * from './repairOrders';
export * from './repairOrders';

// Common/shared types
export * from './common';

// API response types
// export * from './api';

// Legacy type files (keep for backward compatibility during transition)
// export * from './entities';
// export * from './autoRepairs';
// export * from './userManagement';

// Re-export commonly used types with aliases for convenience
export type {
  // Auth aliases
  User as AuthUser,
  UserRole,
  LoginCredentials,
  RegisterData,
  AuthResponse
} from './auth';

export type {
  // Customer aliases
  Customer as CustomerEntity,
  CreateCustomerData,
  CustomerQuery,
  CustomerFilters
} from './customers';

export type {
  // Vehicle aliases
  Vehicle as VehicleEntity,
  CreateVehicleData,
  VehicleQuery,
  VehicleFilters
} from './vehicles';

export type {
  // Employee aliases
  Employee as EmployeeEntity,
  CreateEmployeeData,
  EmployeeQuery,
  EmployeeRole
} from './employees';

export type {
  // Shop aliases
  Shop as ShopEntity,
  CreateShopData,
  ShopQuery
} from './shops';

export type {
  // Appointment aliases
  Appointment as AppointmentEntity,
  CreateAppointmentData,
  AppointmentQuery,
  AppointmentStatus
} from './appointments';

export type {
  // Repair Order aliases
  RepairOrder as RepairOrderEntity,
  CreateRepairOrderData,
  RepairOrderQuery,
  RepairOrderStatus,
  CompleteWorkData,
  AddServiceData,
  AddPartData,
  CostBreakdown,
  WorkmanshipAnalytics
} from './repairOrders';
