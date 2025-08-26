// Service exports - avoid wildcard exports to prevent naming conflicts
export { authService } from './authService';
export { userMngtService } from './userMngtService';
export { customerMngtService } from './customerMngtService';
export { vehicleMngtService } from './vehicleMngtService';
export { vehicleProblemMngtService } from './vehicleProblemMngtService';
export { appointmentMngtService } from './appointmentMngtService';
export { repairOrderMngtService } from './repairOrderMngtService';
export { employeeMngtService } from './employeeMngtService';
export { shopMngtService } from './shopMngtService';
export { dashboardService } from './dashboardService';
export { partMngtService } from './partMngtService';
export { serviceMngtService } from './serviceMngtService';

// Re-export all types from the centralized type system
export type * from '../types';
