import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  // Vehicles
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  
  // Customers
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Appointments
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  
  // Repair Orders
  fetchRepairOrders,
  createRepairOrder,
  updateRepairOrder,
  deleteRepairOrder,
  
  // Employees
  fetchEmployees,
  createEmployee,
  updateEmployee,
  
  // Shops
  fetchShops,
  
  // Error handling
  clearError,
  clearErrors
} from '../store/slices/autoRepairsSlice';

import type { 
  Vehicle, 
  Customer, 
  Appointment, 
  RepairOrder, 
  Employee, 
  Shop
} from '../types/autoRepairs';

export const useAutoRepairs = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.autoRepairs);
  
  // Local state for advanced features
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    vehicles: Vehicle[];
    customers: Customer[];
    appointments: Appointment[];
    repairOrders: RepairOrder[];
    employees: Employee[];
    shops: Shop[];
  }>({ 
    vehicles: [], 
    customers: [], 
    appointments: [],
    repairOrders: [],
    employees: [],
    shops: []
  });

  // Vehicle operations
  const loadVehicles = useCallback((filters?: unknown) => {
    return dispatch(fetchVehicles(filters));
  }, [dispatch]);

  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id'>) => {
    return dispatch(createVehicle(vehicleData));
  }, [dispatch]);

  const editVehicle = useCallback((id: string, vehicleData: Partial<Vehicle>) => {
    return dispatch(updateVehicle({ id, data: vehicleData }));
  }, [dispatch]);

  const removeVehicle = useCallback((id: string) => {
    return dispatch(deleteVehicle(id));
  }, [dispatch]);

  // Customer operations
  const loadCustomers = useCallback((filters?: unknown) => {
    return dispatch(fetchCustomers(filters));
  }, [dispatch]);

  const addCustomer = useCallback((customerData: Omit<Customer, 'id'>) => {
    return dispatch(createCustomer(customerData));
  }, [dispatch]);

  const editCustomer = useCallback((id: string, customerData: Partial<Customer>) => {
    return dispatch(updateCustomer({ id, data: customerData }));
  }, [dispatch]);

  const removeCustomer = useCallback((id: string) => {
    return dispatch(deleteCustomer(id));
  }, [dispatch]);

  // Appointment operations
  const loadAppointments = useCallback((filters?: unknown) => {
    return dispatch(fetchAppointments(filters));
  }, [dispatch]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    return dispatch(createAppointment(appointmentData));
  }, [dispatch]);

  const editAppointment = useCallback((id: string, appointmentData: Partial<Appointment>) => {
    return dispatch(updateAppointment({ id, data: appointmentData }));
  }, [dispatch]);

  const removeAppointment = useCallback((id: string) => {
    return dispatch(deleteAppointment(id));
  }, [dispatch]);

  // Repair Order operations
  const loadRepairOrders = useCallback((filters?: unknown) => {
    return dispatch(fetchRepairOrders(filters));
  }, [dispatch]);

  const addRepairOrder = useCallback((repairOrderData: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt' | 'workOrderNumber'>) => {
    return dispatch(createRepairOrder(repairOrderData));
  }, [dispatch]);

  const editRepairOrder = useCallback((id: string, repairOrderData: Partial<RepairOrder>) => {
    return dispatch(updateRepairOrder({ id, data: repairOrderData }));
  }, [dispatch]);

  const removeRepairOrder = useCallback((id: string) => {
    return dispatch(deleteRepairOrder(id));
  }, [dispatch]);

  // Employee operations
  const loadEmployees = useCallback((filters?: unknown) => {
    return dispatch(fetchEmployees(filters));
  }, [dispatch]);

  const addEmployee = useCallback((employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    return dispatch(createEmployee(employeeData));
  }, [dispatch]);

  const editEmployee = useCallback((id: string, employeeData: Partial<Employee>) => {
    return dispatch(updateEmployee({ id, data: employeeData }));
  }, [dispatch]);

  // Shop operations
  const loadShops = useCallback(() => {
    return dispatch(fetchShops());
  }, [dispatch]);

  // Batch operations
  const loadAllData = useCallback(() => {
    dispatch(fetchVehicles({}));
    dispatch(fetchCustomers({}));
    dispatch(fetchAppointments({}));
    dispatch(fetchRepairOrders({}));
    dispatch(fetchEmployees({}));
    dispatch(fetchShops());
  }, [dispatch]);

  // Search functionality
  const searchAll = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ 
        vehicles: [], 
        customers: [], 
        appointments: [],
        repairOrders: [],
        employees: [],
        shops: []
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use the Redux state filtered by search query
      const vehicles = state.vehicles.filter(v => 
        v.make?.toLowerCase().includes(query.toLowerCase()) ||
        v.model?.toLowerCase().includes(query.toLowerCase()) ||
        v.license_plate?.toLowerCase().includes(query.toLowerCase()) ||
        v.vin?.toLowerCase().includes(query.toLowerCase())
      );

      const customers = state.customers.filter(c => 
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.email?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.toLowerCase().includes(query.toLowerCase())
      );

      const appointments = state.appointments.filter(a => 
        a.description?.toLowerCase().includes(query.toLowerCase())
      );

      const repairOrders = state.repairOrders.filter(r => 
        r.description?.toLowerCase().includes(query.toLowerCase()) ||
        r.orderNumber?.toLowerCase().includes(query.toLowerCase())
      );

      const employees = state.employees.filter(e => 
        e.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        e.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        e.email?.toLowerCase().includes(query.toLowerCase())
      );

      const shops = state.shops.filter(s => 
        s.name?.toLowerCase().includes(query.toLowerCase()) ||
        s.address?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults({
        vehicles,
        customers,
        appointments,
        repairOrders,
        employees,
        shops
      });

      console.log('Search completed for:', query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  // Error handling
  const handleClearError = useCallback((errorType: keyof typeof state.error) => {
    dispatch(clearError(errorType));
  }, [dispatch]);

  const handleClearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  return {
    // State
    vehicles: state.vehicles,
    customers: state.customers,
    appointments: state.appointments,
    repairOrders: state.repairOrders,
    employees: state.employees,
    shops: state.shops,
    loading: state.loading,
    error: state.error,
    
    // Enhanced Features
    isLoading,
    searchResults,
    
    // Vehicle Actions
    loadVehicles,
    addVehicle,
    editVehicle,
    removeVehicle,
    
    // Customer Actions
    loadCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
    
    // Appointment Actions
    loadAppointments,
    addAppointment,
    editAppointment,
    removeAppointment,
    
    // Repair Order Actions
    loadRepairOrders,
    addRepairOrder,
    editRepairOrder,
    removeRepairOrder,
    
    // Employee Actions
    loadEmployees,
    addEmployee,
    editEmployee,
    
    // Shop Actions
    loadShops,
    
    // Batch Operations
    loadAllData,
    
    // Search Operations
    searchAll,
    
    // Error Handling
    clearError: handleClearError,
    clearAllErrors: handleClearAllErrors,
  };
};
