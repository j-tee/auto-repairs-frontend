import { useAppSelector, useAppDispatch } from '../store';
import { 
  fetchVehicles, 
  fetchRepairJobs, 
  fetchCustomers,
  createRepairJob,
  updateRepairJobStatus,
  clearError,
  clearErrors,
  type RepairJob 
} from '../store/slices/autoRepairsSlice';
import { useCallback } from 'react';

export const useAutoRepairs = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.autoRepairs);

  const loadVehicles = useCallback(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const loadRepairJobs = useCallback(() => {
    dispatch(fetchRepairJobs());
  }, [dispatch]);

  const loadCustomers = useCallback(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const loadAllData = useCallback(() => {
    dispatch(fetchVehicles());
    dispatch(fetchRepairJobs());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const createJob = useCallback((jobData: Omit<RepairJob, 'id' | 'createdAt'>) => {
    return dispatch(createRepairJob(jobData));
  }, [dispatch]);

  const updateJobStatus = useCallback((id: string, status: RepairJob['status']) => {
    return dispatch(updateRepairJobStatus({ id, status }));
  }, [dispatch]);

  const handleClearError = useCallback((errorType: keyof typeof state.error) => {
    dispatch(clearError(errorType));
  }, [dispatch]);

  const handleClearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  return {
    // State
    vehicles: state.vehicles,
    repairJobs: state.repairJobs,
    customers: state.customers,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadVehicles,
    loadRepairJobs,
    loadCustomers,
    loadAllData,
    createJob,
    updateJobStatus,
    clearError: handleClearError,
    clearAllErrors: handleClearAllErrors,
  };
};
