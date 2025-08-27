import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import qs from 'qs';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TOKEN_REFRESH_THRESHOLD: Number(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000,
};

// Query string configuration for qs
export const QS_CONFIG = {
  arrayFormat: 'brackets' as const, // ?tags[]=tag1&tags[]=tag2
  encode: true,
  addQueryPrefix: true,
  allowDots: true, // Support nested objects like user.name=John
};

// Types for API operations
export interface ApiQueryParams {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | undefined | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

// Enhanced API Error class
export class ApiError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;
  public isNetworkError: boolean;
  public isTimeoutError: boolean;

  constructor(
    message: string, 
    status?: number, 
    response?: AxiosResponse,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.code = code;
    this.isNetworkError = !response && !status;
    this.isTimeoutError = code === 'ECONNABORTED' || code === 'TIMEOUT';
  }
}

// Create Axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Use qs for query string serialization
  paramsSerializer: (params) => {
    return qs.stringify(params, QS_CONFIG);
  },
});

// Request interceptor for authentication, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Don't add auth token for login/registration endpoints
    const isAuthEndpoint = config.url?.includes('/token/') || 
                          config.url?.includes('/auth/register/') ||
                          config.url?.includes('/auth/verify-email/');
    
    // Add auth token if available and not an auth endpoint
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        hasAuth: !!config.headers.Authorization
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error handling
    const customError = handleAxiosError(error);
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, customError);
    }

    return Promise.reject(customError);
  }
);

// Error handling utility
const handleAxiosError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    let message = `HTTP ${status}: ${error.message}`;
    
    // Try to extract error message from response
    if (typeof data === 'object' && data) {
      if ('message' in data && typeof data.message === 'string') {
        message = data.message;
      } else if ('error' in data && typeof data.error === 'string') {
        message = data.error;
      } else if ('details' in data && typeof data.details === 'string') {
        message = data.details;
      }
    }
    
    return new ApiError(message, status, error.response, error.code);
  } else if (error.request) {
    // Request made but no response received
    return new ApiError('Network error: No response received', undefined, undefined, error.code);
  } else {
    // Something else happened
    return new ApiError(`Request error: ${error.message}`, undefined, undefined, error.code);
  }
};

// Utility function to build query string
export const buildQueryString = (params: ApiQueryParams): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  
  return qs.stringify(filteredParams, QS_CONFIG);
};

// Generic API functions with enhanced features
export const apiGet = async <T>(
  endpoint: string, 
  params?: ApiQueryParams,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.get<T>(endpoint, { 
    params, 
    ...config 
  });
  return response.data;
};

export const apiPost = async <T>(
  endpoint: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.post<T>(endpoint, data, config);
  return response.data;
};

export const apiPut = async <T>(
  endpoint: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.put<T>(endpoint, data, config);
  return response.data;
};

export const apiPatch = async <T>(
  endpoint: string, 
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.patch<T>(endpoint, data, config);
  return response.data;
};

export const apiDelete = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.delete<T>(endpoint, config);
  return response.data;
};

// Enhanced API functions with common patterns
export const apiGetWithPagination = async <T>(
  endpoint: string,
  pagination: PaginationParams = {},
  filters: FilterParams = {},
  sort: SortParams = {}
): Promise<T> => {
  const params = {
    ...pagination,
    ...filters,
    ...sort,
  };
  
  return apiGet<T>(endpoint, params);
};

export const apiGetById = async <T>(
  endpoint: string,
  id: string | number,
  params?: ApiQueryParams
): Promise<T> => {
  return apiGet<T>(`${endpoint}/${id}`, params);
};

export const apiUpdateById = async <T>(
  endpoint: string,
  id: string | number,
  data: unknown
): Promise<T> => {
  return apiPatch<T>(`${endpoint}/${id}`, data);
};

export const apiDeleteById = async <T>(
  endpoint: string,
  id: string | number
): Promise<T> => {
  return apiDelete<T>(`${endpoint}/${id}`);
};

// Retry utility with exponential backoff
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }

    // Only retry on network errors or 5xx status codes
    if (error instanceof ApiError) {
      const shouldRetry = error.isNetworkError || 
                         error.isTimeoutError || 
                         (error.status && error.status >= 500);
      
      if (!shouldRetry) {
        throw error;
      }
    }

    // Wait before retrying with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(apiCall, attempts - 1, delay * 2);
  }
};

// File upload utility
export const apiUploadFile = async <T>(
  endpoint: string,
  file: File,
  field: string = 'file',
  additionalData?: Record<string, string>,
  onUploadProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  formData.append(field, file);
  
  // Add additional form data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await apiClient.post<T>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(progress);
      }
    },
  });

  return response.data;
};

// Auth token management
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  delete apiClient.defaults.headers.common.Authorization;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Health check utility
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  return apiGet('/health');
};
