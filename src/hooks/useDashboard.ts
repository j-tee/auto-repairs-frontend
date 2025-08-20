/**
 * Rebuilt Dashboard Hook - Clean implementation using the new Data Access Layer
 */

import { useState, useCallback, useEffect } from 'react';
import { dataAccess, type DashboardSummary } from '../services/dataAccessLayer';
import { ApiError } from '../utils/api';

// Hook state interface
interface DashboardState {
  data: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  lastSearchQuery: string;
}

// Hook return interface
interface DashboardHookReturn extends DashboardState {
  search: (query: string) => Promise<void>;
  loadAll: () => Promise<void>;
  clearResults: () => void;
  refresh: () => Promise<void>;
}

/**
 * Clean Dashboard Hook
 * Provides search and data loading functionality for the dashboard
 */
export const useDashboard = (): DashboardHookReturn => {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: false,
    error: null,
    lastSearchQuery: ''
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Search across all entities
   */
  const search = useCallback(async (query: string) => {
    try {
      console.log('🎯 Dashboard.search() called with:', query);
      
      updateState({ isLoading: true, error: null });
      
      const result = await dataAccess.searchAll(query);
      
      updateState({
        data: result,
        isLoading: false,
        lastSearchQuery: query,
        error: null
      });

      console.log('🎯 Dashboard.search() completed:', {
        query,
        vehicleCount: result.vehicles.length,
        customerCount: result.customers.length,
        repairJobCount: result.repairJobs.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Search failed';
      
      console.error('🎯 Dashboard.search() failed:', { query, error: errorMessage });
      
      updateState({
        isLoading: false,
        error: errorMessage,
        data: null
      });
    }
  }, [updateState]);

  /**
   * Load all data without search filter
   */
  const loadAll = useCallback(async () => {
    try {
      console.log('🎯 Dashboard.loadAll() called');
      
      updateState({ isLoading: true, error: null });
      
      const result = await dataAccess.getAllData();
      
      updateState({
        data: result,
        isLoading: false,
        lastSearchQuery: '',
        error: null
      });

      console.log('🎯 Dashboard.loadAll() completed:', {
        vehicleCount: result.vehicles.length,
        customerCount: result.customers.length,
        repairJobCount: result.repairJobs.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Failed to load data';
      
      console.error('🎯 Dashboard.loadAll() failed:', { error: errorMessage });
      
      updateState({
        isLoading: false,
        error: errorMessage,
        data: null
      });
    }
  }, [updateState]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    console.log('🎯 Dashboard.clearResults() called');
    updateState({
      data: null,
      error: null,
      lastSearchQuery: ''
    });
  }, [updateState]);

  /**
   * Refresh current view (re-run last search or load all)
   */
  const refresh = useCallback(async () => {
    if (state.lastSearchQuery) {
      await search(state.lastSearchQuery);
    } else {
      await loadAll();
    }
  }, [state.lastSearchQuery, search, loadAll]);

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastSearchQuery: state.lastSearchQuery,
    search,
    loadAll,
    clearResults,
    refresh
  };
};

/**
 * Test Hook for debugging
 * This hook provides direct access to individual search functions
 */
export const useDashboardTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testVehicleSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataAccess.searchVehicles({ query });
      setLastResult(result);
      console.log('🧪 Test vehicle search result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('🧪 Test vehicle search failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testCustomerSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataAccess.searchCustomers({ query });
      setLastResult(result);
      console.log('🧪 Test customer search result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('🧪 Test customer search failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testRepairJobSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataAccess.searchRepairJobs({ query });
      setLastResult(result);
      console.log('🧪 Test repair job search result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('🧪 Test repair job search failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testHealthCheck = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataAccess.healthCheck();
      setLastResult(result);
      console.log('🧪 Health check result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      console.error('🧪 Health check failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    lastResult,
    error,
    testVehicleSearch,
    testCustomerSearch,
    testRepairJobSearch,
    testHealthCheck
  };
};
